const amplifyConfig = {
  Auth: {
    Cognito: {
      region: import.meta.env.VITE_AWS_REGION,
      userPoolId: import.meta.env.VITE_COGNITO_USER_POOL_ID,
      // 👇 FIX 1: Change 'userPoolWebClientId' to 'userPoolClientId'
      userPoolClientId: import.meta.env.VITE_COGNITO_CLIENT_ID,
    },
  },
};

// Debugging Logs (Optional - keep these to verify values are loading)
console.log("Pool ID:", import.meta.env.VITE_COGNITO_USER_POOL_ID);
console.log("Client ID:", import.meta.env.VITE_COGNITO_CLIENT_ID);
console.log("AWS Region:", import.meta.env.VITE_AWS_REGION);

// 👇 FIX 2: Correct the path in the validation check
const cognitoConfig = amplifyConfig.Auth.Cognito;

if (!cognitoConfig.userPoolId || !cognitoConfig.userPoolClientId) {
  console.warn(
    "Warning: AWS Cognito credentials not fully configured. " +
      "Make sure VITE_COGNITO_USER_POOL_ID and VITE_COGNITO_CLIENT_ID are set in .env file."
  );
}

export default amplifyConfig;