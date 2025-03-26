const canvas = document.getElementById('gameCanvas');
const context = canvas.getContext('2d');

//starile initiale
const gameState = {
    spaceship: { x: 400, y: 300, angle: 0, lives: 3},
    asteroids: [],
    rockets: [],
    score: 0,
};

let keys = {};  //obiect care va retine butonul apasat 

window.addEventListener('keydown', (e) => {
    keys[e.key] = true;
}); //se retine tasta apasata
window.addEventListener('keyup', (e) => {
    keys[e.key] = false; //se elimina tasta atunci cand nu mai este apasata
});

window.addEventListener('keydown', (e) => {
    if (e.key === 'r') {
        resetGame();
        requwstAnimationFrame(gameLoop);
    }
    });  //r-butonul de restart al jocului

function updateAsteroids() {
    gameState.asteroids.forEach((asteroid,index) => {
        asteroid.move();
        asteroid.draw();

        //verif coliziunii asteroizilor cu nava spatiala
        const spaceship = gameState.spaceship;
        const distance = Math.sqrt((asteroid.x - spaceship.x) ** 2 + (asteroid.y - spaceship.y) ** 2); //calculam distanta dintre centrul navei si centrul fiecarui asteroid
        if (distance < asteroid.size + 15) {//15=dimens aprox a navei
            console.log("Spaceship collision with asteroid");
            handleSpaceshipCollision();
            return; //iesim din bucla deoarece pentru a preveni coliziunile multiple in acelasi frame
        }

        //verif coliziunii cu alti asteroizi
        gameState.asteroids.forEach((otherAsteroid, otherIndex) => {
            if (index !== otherIndex) {
                const distance = Math.sqrt((asteroid.x - otherAsteroid.x) ** 2 + (asteroid.y - otherAsteroid.y) ** 2);  //calculam distanta dintre 2 asteroizi
                if (distance < asteroid.size + otherAsteroid.size) {
                    asteroid.direction = Math.random() * Math.PI * 2; //schimbam random directia asteroizilor
                    otherAsteroid.direction = Math.random() * Math.PI * 2;  
                }
            }
        });
    });
}

//functia de coliziune a navei cu un asteroid
function handleSpaceshipCollision() {
    const spaceship = gameState.spaceship;

    spaceship.lives--; //reducem nr de vieti

    if (spaceship.lives > 0) {
        console.log("Spaceship hit, lives left: ", spaceship.lives);
        resetSpaceship();
    } else {
        console.log("Game over!");
        resetGame();
    }
}

//functia de resetare a navei dupa decrementarea nr de vieti
function resetSpaceship() {
    gameState.spaceship = { x: 400, y: 300, angle: 0, lives: gameState.spaceship.lives };
    //nava se muta in pozitia initiala
}

//functia de resetare a jocului
function resetGame() {
    gameState.spaceship = { x: 400, y: 300, angle: 0, lives: 3 }; //nava se muta in pozitia initiala si nr de vieti redevine 3
    gameState.asteroids = [];  //se elimina toti asteroizii
    gameState.rockets = [];  //se elimina toate rachetele
    generateAsteroids(7);  //se regenereaza asteroizi noi
    gameState.score = 0;  //se reseteaza scorul la 0
}

//pornirea jocului
function gameLoop() {
    context.clearRect(0, 0, canvas.width, canvas.height); //starea implicita a canvasului

    moveSpaceship(); //deplasarea navei
    drawSpaceship();  //aspectul navei
    updateAsteroids();  //asteroizi
    updateRockets(); //rachete
    drawDetails();  //afisare scor, vieti
    winGame();   //castigarea jocului

    requestAnimationFrame(gameLoop); //redarea in bucla a jocului
}

gameLoop();

//desenarea navei spatiale
function drawSpaceship() {
    const { x, y, angle } = gameState.spaceship;

    context.save();  //salvare stare curenta
    context.translate(x, y);  
    context.rotate(angle);  //selectarea pozitiei si unghiului navei

    context.beginPath();  //incepe desenarea
    context.moveTo(0, -20);   //deseneaza punctul de varf al triunghiului
    context.lineTo(-15, 15);    
    context.lineTo(15, 15);   //traseaza laturile si celelalte 2 varfuri
    context.closePath();    //uneste punctul curent cu cel initial si incheie calea de desenare
    context.fillStyle = 'light blue';
    context.fill();

    context.restore();   //restaureaza starea anterioara a canvas-ului
}



function moveSpaceship() {
    const spaceship = gameState.spaceship;

    //deplasare sus, jos, stanga, dreapta
    if (keys["ArrowLeft"]&&spaceship.x>0) {
        spaceship.x -= 4;
    }
    if (keys["ArrowRight"]&&spaceship.x<canvas.width) {
        spaceship.x += 4;
    }
    if (keys["ArrowUp"]&&spaceship.y>0) {
        spaceship.y -= 4;
    }
    if (keys["ArrowDown"]&&spaceship.y<canvas.height) {
        spaceship.y += 4;
    }

    //rotirea navei
    if (keys["z"]) {
        spaceship.angle -= 0.1;
    }
    if (keys["c"]) {
        spaceship.angle += 0.1;
    }
}

//clasa asteroid
class Asteroid {
    constructor(x, y, size, speed, direction, state) {
          this.x = x;
        this.y = y;
        this.size = size;
          this.speed = speed;
          this.direction = direction;
          this.state = state;  //valoare generata aleator in intervalul 1-4, indicand nr de lovituri de rachete necesar pentru distrugerea asteroidului
    }

    draw() {
        context.beginPath();  //incepe desenarea 
        context.arc(this.x, this.y, this.size, 0, Math.PI * 2); //deseneaza un cerc
        //this.x si this.y=coordonatele centrului
        //this.size=raza
        //0 si Math.PI*2=unghiuri de inceput si sfarsit
        context.fillStyle = `rgba(255, ${255 - this.state * 80}, ${255 - this.state * 80})`;
        //culoarea de umplere e in functie de starea asteroidului (de cate ori a fost lovit)
        context.fill(); //umple cercul cu culoarea respectiva
        context.closePath(); //incheie desenarea
        context.fillStyle = 'lightblue'; //culoarea textului de pe asteroid
        context.font = '14px Arial';
        context.textAlign = 'center';
        context.fillText(Math.floor(this.state), this.x, this.y + 2);
    }

    move() {
        this.x += this.speed * Math.cos(this.direction);
        this.y += this.speed * Math.sin(this.direction);
        //actualizeaza pozitia asteroidului pe axele de coordonate
        //this.speed=viteza obiectului
        //this.direction=unghiul de miscare
        //Math.cos si Math.sin=primeste unghiul in radiani si returneaza un nr intre -1 si 1=componentele x si y ale vectorului de directie

        //realizarea efectului de wrap-around

        if (this.x < 0) { 
            this.x = canvas.width;
        }//verifica daca asteroidul a iesit in afara ecranului prin stanga si il muta la marginea din dreapta

        if (this.x > canvas.width) {
            this.x = 0;
        }//verifica daca asteroidul a iesit din canvas prin dreapta si il muta la marginea din stanga

        if (this.y < 0) {
            this.y = canvas.height;
        }//verifica daca asteroidul a iesit din canvas prin partea de sus si il muta la marginea de jos

        if (this.y > canvas.height) {
            this.y = 0;
        }//verifica daca obiectul a iesit din canvas prin partea de jos si il muta la marginea de sus
    }
}

//generarea asteroizilor
function generateAsteroids(number) {
    for (let i = 0; i < number; i++) {
        const size = Math.random() * 20 + 10; 
        //generare random a dimensiunii asteroidului
        const speed = Math.random() * 2 + 1;
        //generare random a vitezei asteroidului
        const direction = Math.random() * Math.PI * 2;
        //generare random a directiei, un unghi intre 0 si 2 pi
        //math.pi=valoarea lui pi, asadar math.pi*2=2pi=360 grade
        const state = Math.floor(Math.random() * 4) + 1;
        //generare random a starii asteroidului, intre 1-4

        gameState.asteroids.push(new Asteroid(
            Math.random() * canvas.width,  //coordonata x
            Math.random() * canvas.height, //coordonata y
            size, speed, direction, state));

        // noua instanta creata a clasei Asteroid este adaugata in vectorul de asteroizi, pe coordonate x si y generate aleator
    }
}

generateAsteroids(7);

//clasa racheta
class Rocket {
    constructor(x, y, angle) {
        this.x = x; //coordonata x
        this.y = y; //coordonata y
        this.angle = angle; //unghiul de lansare al rachetei
        this.speed = 5; //viteza de lansare a rachetei
        this.size = 5;//dimensiunea rachetei
        this.launched = true;  //racheta a fost lansata
        this.delay = 10;  //timpul de viata al rachetei
    }

    move() {

        if (this.launched) {
            this.delay--;
            if (this.delay <= 0) {
                this.launched = false;  //oricarei rachete lansate i-am setat un timp de viata pentru a evita coliziunea cu nava
            }
        }
        this.x += this.speed * Math.cos(this.angle);
        this.y += this.speed * Math.sin(this.angle);
    }

    //miscarea este la fel ca in cazul navei, mai putin efectul de warp-around

    //desenarea rachetei
    draw() {
        //console.log("Drawing rocket at: ", this.x, this.y);
        context.beginPath();
        context.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        context.fillStyle = 'yellow';
        context.fill();
        context.closePath();
    }
}

//lansarea rachetei
function fireRocket() {
    if (gameState.rockets.length < 3) //verif sa nu fie depasit nr maxim de rachete, adica 3
    {
        const { x, y, angle } = gameState.spaceship;
        console.log("Firing rocket from: ", x, y, angle)
        gameState.rockets.push(new Rocket(x, y, angle));
        // console.log("Rocket launched", gameState.rockets);
    } else {
        console.log("Max rockets reached!");
    }
}

//evenimentul pe tastatura pentru lansarea rachetei
window.addEventListener('keydown', (e) => {
    if (e.key === 'x') {
       // console.log("Fire rocket");
        fireRocket();
       // e.preventDefault();
    }
});

function generateLife() {
    const limit = 30; //valoarea limita la care trebuie sa ajunga scorul pentru a primi o viata noua

    //verif daca scorul a atins limita superioara
    if (gameState.score >= limit) {
        gameState.spaceship.lives++; //adaugam o viata
        gameState.score = 0; //resetam scorul la 0
        console.log("New life! Lives: ",gameState.spaceship.lives); 
    }
}

//functie pentru a afisa scorul si vietile in canvas
function drawDetails() {
    context.fillStyle = 'white';
    context.font = '16px Arial';
    context.fillText(`Score: ${gameState.score}`, 40, 20);  //x=40, y=20-coordonatele pt afisarea textului
    context.fillText(`Lives: ${gameState.spaceship.lives}`, 40, 40);
}

function updateRockets() {
    gameState.rockets.forEach((rocket, rocketIndex) => {
        rocket.move();
        rocket.draw();

        if (rocket.launched) return; //daca racheta a fost lansata, nu mai facem verificari

        //verificarea coliziunii rachetei cu asteroidul
        gameState.asteroids.forEach((asteroid, asteroidIndex) => {
            const distance = Math.sqrt((rocket.x - asteroid.x) ** 2 + (rocket.y - asteroid.y) ** 2); // calculam distanta dintre racheta si asteroid
            if (distance < asteroid.size + rocket.size) { // daca exista coliziune intre cele doua obiecte
                asteroid.state--;//scadem starea asteroidului=nr de lovituri ramase pt distrugerea asteroidului
                if (asteroid.state <= 0) {  //daca starea asteroidului ajunge <=0
                    gameState.score += 10; //adaugam puncte pentru un asteroid distrus
                    console.log("Score: ", gameState.score);
                    generateLife(); //verif daca se poate regenera o viata
                    gameState.asteroids.splice(asteroidIndex, 1); //eliminam asteroidul
                }
                //la final, eliminam racheta
                gameState.rockets.splice(rocketIndex, 1);
                return; //iese din bucla deoarece, odata ce o racheta a lovit un asteroid si este eliminata, nu mai poate lovi alti asteroizi
            }
        });

        //daca o racheta ajunge in afara canvasului, o eliminam
        if (rocket.x < 0 || rocket.x > canvas.width || rocket.y < 0 || rocket.y > canvas.height) {
            gameState.rockets.splice(rocketIndex, 1);
        }
    });
}

function winGame() {
    if (gameState.asteroids.length === 0) {
        context.fillStyle = 'white';
        context.font = '30px Arial';
        context.textAlign = 'center';
        context.fillText('You win! Press R to restart game', canvas.width / 2, canvas.height / 2);
        console.log("You win!");
        return;
    }
   
}