import { apiClient } from "./apiClient"

export const userService = {
    getUserBalance(): Promise<number> {
        return apiClient.get<number>("/users/balance");
    }
};