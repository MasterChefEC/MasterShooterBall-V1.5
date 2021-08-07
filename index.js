const canvas = document.querySelector("canvas");
const scoreElement = document.querySelector("#scoreElement");
const scoreTotal = document.querySelector("#scoreTotal");
const btnStartGame = document.querySelector("#btnStartGame");
const btnPuntuaciones = document.querySelector("#btnPuntuaciones");
const container = document.querySelector("#container");
var userID = sessionStorage.getItem("userID");
console.log(userID);
const ctx = canvas.getContext("2d");
let Firebase = firebase.firestore();
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;
let docID = "";
let docScore = 0;

const getUser = async () => {
  const usersRef = Firebase.collection("users");
  const snapshot = await usersRef.where("user", "==", userID).get();
  if (snapshot.empty) {
    Firebase.collection("users")
      .add({
        user: userID,
        score: score,
      })
      .then(function (docRef) {
        console.log("Document id: ", docRef.id);
      })
      .catch(function (err) {
        console.log("Error Founded: ", err);
      });
  }
  snapshot.forEach((doc) => {
    docID += doc.id;
    console.log(docID);
    docScore += doc.data().score;
    console.log(docScore);
    console.log(score);
  });
  const setScore = async () => {
    if (docScore < score) {
      try {
        console.log("Si es mayor y se hará update en la BD");
        let userUpdate = {
          user: userID,
          score: score,
        };
        console.log(docID);
        await Firebase.collection("users")
          .doc(docID.toString())
          .set(userUpdate);
      } catch (error) {
        console.log(error);
      }
    } else {
      console.log("No es mayor");
    }
  };
  setScore();
};

class Player {
  constructor(x, y, radius, color) {
    this.x = x;
    this.y = y;
    this.radius = radius;
    this.color = color;
  }
  draw() {
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2, false);
    ctx.fillStyle = this.color;
    ctx.fill();
  }
}

class Projectile {
  constructor(x, y, radius, color, velocity) {
    this.x = x;
    this.y = y;
    this.radius = radius;
    this.color = color;
    this.velocity = velocity;
  }
  draw() {
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 3, false);
    ctx.fillStyle = this.color;
    ctx.fill();
  }
  update() {
    this.draw();
    this.x = this.x + this.velocity.x;
    this.y = this.y + this.velocity.y;
  }
}
class Enemy {
  constructor(x, y, radius, color, velocity) {
    this.x = x;
    this.y = y;
    this.radius = radius;
    this.color = color;
    this.velocity = velocity;
  }
  draw() {
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2, false);
    ctx.fillStyle = this.color;
    ctx.fill();
  }
  update() {
    this.draw();
    this.x = this.x + this.velocity.x;
    this.y = this.y + this.velocity.y;
  }
}
class PowerUp {
  constructor(x, y, radius, color, velocity) {
    this.x = x;
    this.y = y;
    this.radius = radius;
    this.color = color;
    this.velocity = velocity;
  }
  draw() {
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 1, false);
    ctx.fillStyle = this.color;
    ctx.fill();
  }
  update() {
    this.draw();
    this.x = this.x + this.velocity.x;
    this.y = this.y + this.velocity.y;
  }
}
const friction = 0.98;
class Particle {
  constructor(x, y, radius, color, velocity) {
    this.x = x;
    this.y = y;
    this.radius = radius;
    this.color = color;
    this.velocity = velocity;
    this.alpha = 1;
  }
  draw() {
    ctx.save();
    ctx.globalAlpha = this.alpha;
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2, false);
    ctx.fillStyle = this.color;
    ctx.fill();
    ctx.restore();
  }
  update() {
    this.draw();
    this.velocity.x *= friction;
    this.velocity.y *= friction;
    this.x = this.x + this.velocity.x;
    this.y = this.y + this.velocity.y;
    this.alpha -= 0.01;
  }
}

const x = canvas.width / 2;
const y = canvas.height / 2;

let player = new Player(x, y, 30, "white");
let projectiles = [];
let enemies = [];
let powerUps = [];
let particles = [];
let Difficulty = 2000;
let interval = null;
let intervalVelocity = null;
let intervalPowerUp = null;
let score = 0;
let controler = false;

function init() {
  player = new Player(x, y, 30, "white");
  docID = "";
  docScore = 0;
  score = 0;
  scoreElement.innerHTML = score;
  scoreTotal.innerHTML = score;
  projectiles = [];
  enemies = [];
  powerUps = [];
  particles = [];
  Difficulty = 2000;
  interval = null;
  intervalVelocity = null;
  intervalPowerUp = null;
  controler = false;
}
//Generar Enemigos
function spawnEnemies() {
  function SpawnEnemy() {
    const radius = Math.random() * (30 - 7) + 7;

    let x, y;
    if (Math.random() < 0.5) {
      x = Math.random() < 0.5 ? 0 - radius : canvas.width + radius;
      y = Math.random() * canvas.height;
    } else {
      x = Math.random() * canvas.width;
      y = Math.random() < 0.5 ? 0 - radius : canvas.height + radius;
    }
    const color = `hsl(${Math.random() * 360}, 50%, 50%)`;

    const angle = Math.atan2(canvas.height / 2 - y, canvas.width / 2 - x);
    const velocity = {
      x: Math.cos(angle),
      y: Math.sin(angle),
    };

    intervalVelocity = setInterval(() => {
      velocity.x *= 2;
      velocity.y *= 2;
    }, 3000);
    enemies.push(new Enemy(x, y, radius, color, velocity));
  }
  interval = setInterval(SpawnEnemy, Difficulty);

  setTimeout(() => {
    clearInterval(interval);
    Difficulty = 1500;
    interval = setInterval(SpawnEnemy, Difficulty);
  }, 12000);
  setTimeout(() => {
    clearInterval(interval);
    Difficulty = 1000;
    interval = setInterval(SpawnEnemy, Difficulty);
  }, 17000);
  setTimeout(() => {
    clearInterval(interval);
    Difficulty = 800;
    interval = setInterval(SpawnEnemy, Difficulty);
  }, 21000);
}
//Generar PowerUps
function SpawnPowerUps() {
  function SpawnPowerUp() {
    console.log("Generé un power Up");
    const radius = 20;
    let x, y;
    if (Math.random() < 0.5) {
      x = Math.random() < 0.5 ? 0 - radius : canvas.width + radius;
      y = Math.random() * canvas.height;
    } else {
      x = Math.random() * canvas.width;
      y = Math.random() < 0.5 ? 0 - radius : canvas.height + radius;
    }
    const color = "red";

    const angle = Math.atan2(canvas.height / 2 - y, canvas.width / 2 - x);
    const velocity = {
      x: Math.cos(angle),
      y: Math.sin(angle),
    };
    powerUps.push(new PowerUp(x, y, radius, color, velocity));
  }
  setTimeout(() => {
    SpawnPowerUp();
  }, 8000);
  setTimeout(() => {
    intervalPowerUp = setInterval(SpawnPowerUp, 21000);
  }, 8000);
}

let animationId;

function animate() {
  animationId = requestAnimationFrame(animate);
  ctx.fillStyle = "rgba(0,0,0,0.1)";
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  player.draw();
  particles.forEach((particle, index) => {
    if (particle.alpha <= 0) {
      particles.splice(index, 1);
    } else {
      particle.update();
    }
  });
  projectiles.forEach((projectile, projectileIndex) => {
    projectile.update();

    //Remover proyectiles si salen de pantalla
    if (
      projectile.x - projectile.radius < 0 ||
      projectile.x - projectile.radius > canvas.width ||
      projectile.y + projectile.radius < 0 ||
      projectile.y - projectile.radius > canvas.height
    ) {
      setTimeout(() => {
        projectiles.splice(projectileIndex, 1);
      }, 0);
    }
  });
  enemies.forEach((enemy, index) => {
    enemy.update();

    //Funcion para fin de juego
    const dist = Math.hypot(player.x - enemy.x, player.y - enemy.y);
    if (dist - enemy.radius - player.radius < 1) {
      cancelAnimationFrame(animationId);
      container.style.display = "flex";
      scoreTotal.innerHTML = score;

      enemies = [];
      powerUps = [];
      clearInterval(interval);
      clearInterval(intervalVelocity);
      clearInterval(intervalPowerUp);
      getUser();
    }
    //Proyectil vs enemigo
    projectiles.forEach((projectile, projectileIndex) => {
      const dist = Math.hypot(projectile.x - enemy.x, projectile.y - enemy.y);

      //Si el proyectil impacta al enemigo
      if (dist - enemy.radius - projectile.radius < 1) {
        //Aumenta el Scoreboard

        for (let i = 0; i < enemy.radius * 2; i++) {
          particles.push(
            new Particle(
              projectile.x,
              projectile.y,
              Math.random() * 2,
              enemy.color,
              {
                x: (Math.random() - 0.5) * (Math.random() * 8),
                y: (Math.random() - 0.5) * (Math.random() * 8),
              }
            )
          );
        }
        if (enemy.radius - 10 > 10) {
          score += 50;
          scoreElement.innerHTML = score;
          gsap.to(enemy, {
            radius: enemy.radius - 10,
          });
          setTimeout(() => {
            projectiles.splice(projectileIndex, 1);
          }, 0);
        } else {
          score += 100;
          scoreElement.innerHTML = score;
          setTimeout(() => {
            enemies.splice(index, 1);
            projectiles.splice(projectileIndex, 1);
          }, 0);
        }
      }
    });
  });

  //Power Up
  powerUps.forEach((powerUp, index) => {
    powerUp.update();

    //Funcion para jugador + powerUp
    const dist = Math.hypot(player.x - powerUp.x, player.y - powerUp.y);
    if (dist - powerUp.radius - player.radius < 1) {
      console.log("Llegué al jugador");
      enemies.forEach((enemy) => {
        for (let i = 0; i < enemy.radius * 2; i++) {
          particles.push(
            new Particle(enemy.x, enemy.y, Math.random() * 2, enemy.color, {
              x: (Math.random() - 0.5) * (Math.random() * 8),
              y: (Math.random() - 0.5) * (Math.random() * 8),
            })
          );
        }
        setTimeout(() => {
          enemies.splice(index, 1);
        }, 0);
        score += 100;
        scoreElement.innerHTML = score;
      });
      setTimeout(() => {
        powerUps.splice(index, 1);
      }, 0);
    }
    //Proyectil vs powerUp
    projectiles.forEach((projectile, projectileIndex) => {
      const dist = Math.hypot(
        projectile.x - powerUp.x,
        projectile.y - powerUp.y
      );

      //Si el proyectil impacta al powerUp
      if (dist - powerUp.radius - projectile.radius < 1) {
        for (let i = 0; i < powerUp.radius * 2; i++) {
          particles.push(
            new Particle(
              projectile.x,
              projectile.y,
              Math.random() * 2,
              powerUp.color,
              {
                x: (Math.random() - 0.5) * (Math.random() * 8),
                y: (Math.random() - 0.5) * (Math.random() * 8),
              }
            )
          );
        }
        setTimeout(() => {
          powerUps.splice(index, 1);
          projectiles.splice(projectileIndex, 1);
        }, 0);
      }
    });
  });
}

window.addEventListener("click", (event) => {
  //Se consigue el ángulo del proyectil con ArcTan de la posición del puntero y restado para la posición central
  const angle = Math.atan2(
    event.clientY - canvas.height / 2,
    event.clientX - canvas.width / 2
  );
  const velocity = {
    //Si multiplicas cambia la velocidad a más alta
    x: Math.cos(angle) * 4,
    y: Math.sin(angle) * 4,
  };
  projectiles.push(
    new Projectile(canvas.width / 2, canvas.height / 2, 5, "white", velocity)
  );
});

btnStartGame.addEventListener("click", () => {
  init();
  animate();
  spawnEnemies();
  SpawnPowerUps();
  container.style.display = "none";
});

btnPuntuaciones.addEventListener("click", () => {
  const getPuntuaciones = async () => {
    let count = 0;
    const listGroup = document.querySelector("#listGroup");
    try {
      const PuntuacionesRef = Firebase.collection("users");
      const lastTenRes = await PuntuacionesRef.orderBy("score", "desc")
        .limit(10)
        .get();
      lastTenRes.forEach((doc) => {
        count = count + 1;
        console.log(doc.data());
        listGroup.innerHTML += `
        <li  key={doc.id}>${count} ${doc.data().user} ---> ${
          doc.data().score
        }</li>
        `;
      });
    } catch (error) {
      console.log(error);
    }
    const btnRegresar = document.querySelector("#btnRegresar");

    btnRegresar.addEventListener("click", () => {
      window.location.reload();
    });
  };
  container.innerHTML = `
  <div class="bg-white max-w-md w-full p-6 text-center">
  <div>
          <h1
            id="ListadoScores"
            class=" font-bold leading-none select-none mb-3"
          >
            Listado de Scores
          </h1>
          <ul class = "text-sm text-gray-700 mb-2 select-none mb-3" id='listGroup'><ul>
          </div>
          <div>
            <button
              id="btnRegresar"
              class="bg-blue-500 text-white w-full py-3 rounded-full mb-2"
            >
              Regresar
            </button>
            `;
  getPuntuaciones();
});
