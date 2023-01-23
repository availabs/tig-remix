import {
  createCookieSessionStorage,
  redirect,
} from "@remix-run/node";


const sessionSecret = 'foobar';
if (!sessionSecret) {
  throw new Error("SESSION_SECRET must be set");
}

const storage = createCookieSessionStorage({
  cookie: {
    name: "availauth_session",
    secure: process.env.NODE_ENV === "production",
    secrets: [sessionSecret],
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 30,
    httpOnly: true,
  },
});

function getUserSession(request) {
  return storage.getSession(request.headers.get("Cookie"));
}


export async function checkAuth(
  request,
  redirectTo 
) {
  if(!redirectTo) {
    redirectTo = new URL(request.url).pathname
  }
  const session = await getUserSession(request);
  const userSession = session.get("user");
  let user = null
  if(userSession){
    user = JSON.parse(userSession)
  } 
  return user;
}

export async function createUserSession(
  user,
  redirectTo = '/'
) {
  const session = await storage.getSession();
  session.set("user", JSON.stringify(user.user));
  return redirect(redirectTo, {
    headers: {
      "Set-Cookie": await storage.commitSession(session),
    },
  });
}


export async function logout(request) {
  const session = await getUserSession(request);
  console.log(new URL(request.url).pathname)
  return redirect("/", {
    headers: {
      "Set-Cookie": await storage.destroySession(session),
    },
  });
}