import { queryKeys } from "@/configs/queryKeys";
import { useQuery } from "@tanstack/react-query";
import { useNavigate } from "@tanstack/react-router";
import { FC, useEffect } from "react";

export const IndexPage: FC = () => {
  const navigate = useNavigate();
  const { data: userData, error: userDataError } = useQuery({
    ...queryKeys.users.details,
    retry: false,
  });

  useEffect(() => {
    if (userDataError) {
      navigate({ to: "/sign-in" });
    }
  }, [userDataError, navigate]);

  if (!userData) {
    return null;
  }

  return (
    <div>
      <h1>Hello {userData.username}</h1>
      <h1>Email Active: {String(userData.emailActive)}</h1>
    </div>
  );
};
