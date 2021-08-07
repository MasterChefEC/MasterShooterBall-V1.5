const Login = document.querySelector("#Login");
const nombreUsuario = document.querySelector("#nombreUsuario");

firebase.auth().onAuthStateChanged((user) => {
  if (user) {
    //Login.innerHTML = ``
    nombreUsuario.innerHTML = user.displayName;
    sessionStorage.setItem("userID", user.displayName);
    cerrarSesion();
  } else {
    console.log("No hay user");
    Login.innerHTML = `
    <div class="items-center justify-center text-center text-white">
      <h1 class="mb-3">Por favor, Inicie Sesión</h1>
      <button id="btnAcceder" class="bg-transparent hover:bg-blue-500 text-blue-700 font-semibold hover:text-white py-2 px-4 border border-blue-500 hover:border-transparent rounded">Acceder</button>
    </div>`;
    iniciarSesion();
  }
});

const iniciarSesion = () => {
  const btnAcceder = document.querySelector("#btnAcceder");
  btnAcceder.addEventListener("click", async () => {
    try {
      const provider = new firebase.auth.GoogleAuthProvider();
      await firebase.auth().signInWithPopup(provider);
    } catch (error) {
      console.log(error);
    }
    window.location.reload();
  });
};
const cerrarSesion = () => {
  const btnCerrarSesion = document.querySelector("#btnCerrarSesion");
  btnCerrarSesion.addEventListener("click", () => {
    firebase.auth().signOut();
    sessionStorage.removeItem("userID");
  });
};
