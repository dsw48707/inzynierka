export const msalConfig = {
    auth: {
        clientId: "a666fdc9-c25b-420f-b05d-195a3a2c6602",
        authority: "https://login.microsoftonline.com/73be1920-e055-448a-9797-00d8e74ff908",
        redirectUri: "http://localhost:5173/",
    },
   cache: {
        cacheLocation: "localStorage", 
        storeAuthStateInCookie: false,
    },
};
export const graphConfig = {
    graphMeEndpoint: "https://graph.microsoft.com/v1.0/me",
    graphUsersEndpoint: "https://graph.microsoft.com/v1.0/users?$select=displayName,userPrincipalName&$top=999" 
};
export const loginRequest = {
    scopes: ["User.Read", "User.Read.All"], 
};