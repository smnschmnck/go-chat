package chatService

import (
	"chat/authService"
	"chat/contactService"
	"chat/dbHelpers/postgresHelper"
	"chat/userService"
	"context"
	"errors"
	"fmt"
	"strings"
	"time"

	"github.com/georgysavva/scany/pgxscan"
	"github.com/google/uuid"
	"github.com/jackc/pgx/v4/pgxpool"

	"github.com/go-playground/validator/v10"
	"github.com/gofiber/fiber/v2"
)

var validate = validator.New()

func StartOneOnOneChat(c *fiber.Ctx) error {
	sessionID, responseErr := authService.GetBearer(c)
	if responseErr != nil {
		return c.Status(401).SendString("NOT AUTHORIZED")
	}

	reqUUID, err := userService.GetUUIDBySessionID(sessionID)
	if err != nil {
		return c.Status(401).SendString("NOT AUTHORIZED")
	}

	type startReq struct {
		ParticipantUUID string `json:"participantUUID" validate:"required"`
	}
	var req startReq
	err = c.BodyParser(&req)
	if err != nil {
		return c.Status(400).SendString("BAD REQUEST")
	}
	err = validate.Struct(req)
	if err != nil {
		return c.Status(400).SendString("BAD REQUEST")
	}

	contacts, err := contactService.GetUserContactsbyUUID(reqUUID)
	if err != nil {
		return c.Status(500).SendString(err.Error())
	}

	isInContacts := false
	for _, c := range contacts {
		if c.Uuid == req.ParticipantUUID {
			isInContacts = true
			break
		}
	}
	if !isInContacts {
		return c.Status(500).SendString("USER NOT IN CONTACTS")
	}

	ctx := context.Background()
	conn, err := pgxpool.Connect(ctx, postgresHelper.PGConnString)
	if err != nil {
		return c.Status(500).SendString("INTERNAL ERROR")
	}
	defer conn.Close()

	//Complex SQL Query ahead
	/*
		SELECT ALL one_on_one chats which belong to one of two UUIDs
		If the same chat_id exists for both UUIDs (twice) it must mean
		that a one_on_one chat must already exist between both uuids
	*/
	checkChatExistsQuery := "SELECT count(user_chat.chat_id) >= 2 AS chatcount " +
		"FROM user_chat " +
		"JOIN chats c on user_chat.chat_id = c.chat_id " +
		"WHERE chat_type='one_on_one' " +
		"AND (uuid=$1 OR uuid=$2) " +
		"GROUP BY c.chat_id " +
		"ORDER BY chatcount DESC " +
		"LIMIT 1"
	var chatExists bool
	err = conn.QueryRow(ctx, checkChatExistsQuery, reqUUID, req.ParticipantUUID).Scan(&chatExists)
	if err != nil {
		if err.Error() == "no rows in result set" {
			chatExists = false
		} else {
			return c.Status(500).SendString("INTERNAL ERROR")
		}
	}
	if chatExists {
		return c.Status(409).SendString("CHAT EXISTS ALREADY")
	}

	chatID := uuid.New().String()
	var dbChatID string
	createChatQuery := "INSERT INTO chats(chat_id, name, picture_url, chat_type) " +
		"VALUES ($1, '', '','one_on_one') " +
		"RETURNING chat_id"
	err = conn.QueryRow(ctx, createChatQuery, chatID).Scan(&dbChatID)
	if err != nil {
		return c.Status(500).SendString("INTERNAL ERROR")
	}

	insertSelfIntoChatQuery := "INSERT INTO user_chat(uuid, chat_id, unread_messages) " +
		"VALUES($1, $2, 0) " +
		"RETURNING chat_id"
	err = conn.QueryRow(ctx, insertSelfIntoChatQuery, reqUUID, chatID).Scan(&dbChatID)
	if err != nil {
		return c.Status(500).SendString("INTERNAL ERROR")
	}

	insertParticipantIntoChatQuery := "INSERT INTO user_chat(uuid, chat_id, unread_messages) " +
		"VALUES($1, $2, 0) " +
		"RETURNING chat_id"
	err = conn.QueryRow(ctx, insertParticipantIntoChatQuery, req.ParticipantUUID, chatID).Scan(&dbChatID)
	if err != nil {
		return c.Status(500).SendString("INTERNAL ERROR")
	}

	return c.SendString("SUCCESS")
}

type singleChat struct {
	ChatID         string  `json:"chatID"`
	Name           string  `json:"chatName"`
	PictureUrl     string  `json:"pictureUrl"`
	UnreadMessages int     `json:"unreadMessages"`
	MessageType    *string `json:"messageType"`
	TextContent    *string `json:"textContent"`
	Timestamp      *int    `json:"timestamp"`
	DeliveryStatus *string `json:"deliveryStatus"`
	SenderID       *string `json:"senderID"`
}

func GetChatsByUUID(uuid string) ([]singleChat, error) {
	ctx := context.Background()
	conn, err := pgxpool.Connect(ctx, postgresHelper.PGConnString)
	if err != nil {
		return []singleChat{}, errors.New("INTERNAL ERROR")
	}
	defer conn.Close()

	getChatsQuery := "SELECT c.chat_id, ( " +
		"CASE c.chat_type WHEN 'one_on_one' THEN ( " +
		"SELECT users.username AS name " +
		"FROM users " +
		"JOIN user_chat uc on users.uuid = uc.uuid " +
		"JOIN chats c on uc.chat_id = c.chat_id " +
		"WHERE c.chat_type='one_on_one' AND uc.uuid!=$1 " +
		") ELSE c.name END " +
		"), " +
		"( " +
		"CASE c.chat_type WHEN 'one_on_one' THEN ( " +
		"SELECT users.picture_url AS picture_url " +
		"FROM users " +
		"JOIN user_chat uc on users.uuid = uc.uuid " +
		"JOIN chats c on uc.chat_id = c.chat_id " +
		"WHERE c.chat_type='one_on_one' AND uc.uuid!=$1 " +
		") ELSE c.picture_url END " +
		"), " +
		"u.unread_messages, " +
		"m.message_type, " +
		"m.text_content, " +
		"m.timestamp, " +
		"m.delivery_status, " +
		"m.sender_id " +
		"FROM user_chat u " +
		"JOIN chats c ON u.chat_id = c.chat_id " +
		"LEFT JOIN chatmessages m ON m.message_id = c.last_message_id " +
		"WHERE u.uuid=$1"
	var chats []singleChat
	err = pgxscan.Select(ctx, conn, &chats, getChatsQuery, uuid)
	if err != nil {
		return []singleChat{}, errors.New("INTERNAL ERROR")
	}

	if chats == nil {
		return make([]singleChat, 0), nil
	}

	return chats, nil
}

func GetChats(c *fiber.Ctx) error {
	sessionID, responseErr := authService.GetBearer(c)
	if responseErr != nil {
		return c.Status(401).SendString("NOT AUTHORIZED")
	}

	reqUUID, err := userService.GetUUIDBySessionID(sessionID)
	if err != nil {
		return c.Status(401).SendString("NOT AUTHORIZED")
	}

	chats, err := GetChatsByUUID(reqUUID)
	if err != nil {
		return c.Status(500).SendString(err.Error())
	}

	return c.JSON(chats)
}

func isUserInChat(uuid string, chatID string) (bool, error) {
	chats, err := GetChatsByUUID(uuid)
	if err != nil {
		return false, err
	}
	for _, chat := range chats {
		if chat.ChatID == chatID {
			return true, nil
		}
	}
	return false, nil
}

func SendMessage(c *fiber.Ctx) error {
	sessionID, responseErr := authService.GetBearer(c)
	if responseErr != nil {
		return c.Status(401).SendString("NOT AUTHORIZED")
	}

	reqUUID, err := userService.GetUUIDBySessionID(sessionID)
	if err != nil {
		return c.Status(401).SendString("NOT AUTHORIZED")
	}

	type reqBody struct {
		ChatID      string `json:"chatID" validate:"required"`
		TextContent string `json:"textContent"`
		MessageType string `json:"messageType" validate:"required"`
		MediaUrl    string `json:"mediaUrl"`
	}

	var req reqBody
	err = c.BodyParser(&req)
	if err != nil {
		return c.Status(400).SendString("BAD REQUEST")
	}
	err = validate.Struct(req)
	if err != nil {
		fmt.Println(err)
		return c.Status(400).SendString("BAD REQUEST")
	}

	//make sure platform only media URLs are being sent. TLDR: More comprehensive validation
	mediaUrlExists := len(req.MediaUrl) > 0
	if mediaUrlExists {
		if req.MessageType == "plaintext" {
			return c.Status(400).SendString("MEDIA URL NOT ALLOWED FOR TYPE PLAINTEXT")
		}
		hasWrongDomain := !strings.HasPrefix(req.MediaUrl, "storage.emyht.com/")
		if hasWrongDomain {
			return c.Status(400).SendString("BAD MEDIA URL DOMAIN")
		}
	}

	if req.MessageType == "plaintext" && len(req.TextContent) < 1 {
		return c.Status(400).SendString("MESSAGE TOO SHORT")
	}

	inChat, err := isUserInChat(reqUUID, req.ChatID)
	if err != nil {
		return c.Status(500).SendString(err.Error())
	}
	if !inChat {
		return c.Status(401).SendString("USER NOT IN CHAT")
	}

	ctx := context.Background()
	conn, err := pgxpool.Connect(ctx, postgresHelper.PGConnString)
	if err != nil {
		return c.Status(500).SendString("INTERNAL ERROR")
	}
	defer conn.Close()

	messageQuery := "INSERT INTO chatmessages(message_id, chat_id, sender_id, text_content, message_type, media_url, timestamp, delivery_status) " +
		"VALUES ($1, $2, $3, $4, $5, $6, $7, 'sent') " +
		"RETURNING message_id"

	rows := conn.QueryRow(ctx, messageQuery, uuid.New(), req.ChatID, reqUUID, req.TextContent, req.MessageType, req.MediaUrl, time.Now().Unix())
	var messageID string
	err = rows.Scan(&messageID)
	if err != nil {
		return c.Status(500).SendString("INTERNAL ERROR")
	}

	var chatID string
	//add into chats as last_message_id
	lastChatMessageQuery := "UPDATE chats " +
		"SET last_message_id=$1 " +
		"WHERE chat_id=$2 " +
		"RETURNING chat_id"
	rows = conn.QueryRow(ctx, lastChatMessageQuery, messageID, req.ChatID)
	err = rows.Scan(&chatID)
	if err != nil {
		return c.Status(500).SendString("INTERNAL ERROR")
	}

	type resBody struct {
		ChatID    string `json:"chatID"`
		MessageID string `json:"messageID"`
	}
	res := resBody{
		ChatID:    chatID,
		MessageID: messageID,
	}
	return c.JSON(res)
}

type singleMessage struct {
	MessageID      string `json:"messageID" validate:"required"`
	SenderID       string `json:"senderID" validate:"required"`
	SenderUsername string `json:"senderUsername" validate:"required"`
	TextContent    string `json:"textContent" validate:"required"`
	MessageType    string `json:"messageType" validate:"required"`
	MediaUrl       string `json:"medieUrl" validate:"required"`
	Timestamp      int    `json:"timestamp" validate:"required"`
	DeliveryStatus string `json:"deliveryStatus" validate:"required"`
}

func GetMessages(c *fiber.Ctx) error {
	sessionID, responseErr := authService.GetBearer(c)
	if responseErr != nil {
		return c.Status(401).SendString("NOT AUTHORIZED")
	}

	reqUUID, err := userService.GetUUIDBySessionID(sessionID)
	if err != nil {
		return c.Status(401).SendString("NOT AUTHORIZED")
	}

	chatID := c.Params("chatID")
	if len(chatID) <= 0 {
		c.Status(500).SendString("MISSING CHAT ID")
	}

	inChat, err := isUserInChat(reqUUID, chatID)
	if err != nil {
		return c.Status(500).SendString(err.Error())
	}
	if !inChat {
		return c.Status(401).SendString("USER NOT IN CHAT")
	}

	ctx := context.Background()
	conn, err := pgxpool.Connect(ctx, postgresHelper.PGConnString)
	if err != nil {
		return c.Status(500).SendString("INTERNAL ERROR")
	}
	defer conn.Close()

	query := "SELECT message_id, sender_id, username AS sender_username, text_content, message_type, media_url, timestamp, delivery_status " +
		"FROM chatmessages " +
		"JOIN users u on u.uuid = chatmessages.sender_id " +
		"WHERE chat_id=$1"
	var messages []singleMessage
	err = pgxscan.Select(ctx, conn, &messages, query, chatID)
	if err != nil {
		return c.Status(500).SendString("INTERNAL ERROR")
	}

	if messages == nil {
		return c.JSON(make([]singleChat, 0))
	}

	return c.JSON(messages)
}
