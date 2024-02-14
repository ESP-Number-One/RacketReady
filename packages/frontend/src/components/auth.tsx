import { useAuth0 } from "@auth0/auth0-react";

export function LoginButton() {
  const { loginWithRedirect } = useAuth0();

  return (
    <button
      className="font-title text-4xl text-white bg-p-green-100 hover:bg-p-green-200 focus:ring-4 focus:ring-blue-300 font-medium rounded-lg px-5 py-2.5 me-2 mb-2 focus:outline-none w-full"
      onClick={() => {
        loginWithRedirect().catch(console.error);
      }}
      type="button"
    >
      Log In/Sign up
    </button>
  );
}

export function LogoutButton() {
  const { logout } = useAuth0();

  return (
    <button
      className="font-title text-4xl text-white bg-p-grey-100 hover:bg-p-grey-200 focus:ring-4 focus:ring-blue-300 font-medium rounded-lg px-5 py-2.5 me-2 mb-2 focus:outline-none w-full"
      onClick={() => {
        logout({ logoutParams: { returnTo: window.location.origin } }).catch(
          console.error,
        );
      }}
      type="button"
    >
      Log Out
    </button>
  );
}
