//Canvas
const canvas = document.getElementById('breakout');
const ctx = canvas.getContext('2d');
const start = document.getElementById("startGame");

//Komponente
const Id = (id) => ({ id });
const Position = (x, y) => ({ Position: { x, y } }); //pozicija
const Velocity = (vx, vy) => ({ Velocity: { vx, vy } });  //brzina
const Size = (width, height) => ({ Size: { width, height } });  //velicina (paddle, bricks)
const Ball = (radius) => ({ Ball: { radius } });
const Paddle = (width, height) => ({ Paddle: { width, height } });
const Brick = () => ({ Brick: true });
const Status = (active = true) => ({ Status: { active } });
const Particle = (vx, vy, lifetime) => ({
    Particle: { vx, vy, lifetime }
});

const createParticle = (x, y, numParticles = 10) =>
    [...Array(numParticles)] //Kreira niz sa `numParticles` elemenata
        .map(() => {
            const vx = (Math.random() - 0.5) * 4; //-2 do 2
            const vy = (Math.random() - 0.5) * 4; //-2 do 2
            const lifetime = Math.random() * 60 + 30; //30 - 90
            return createEntity(Position(x, y), Particle(vx, vy, lifetime));
        });


//Kreiranje entiteta
const createEntity = (...components) => Object.assign({}, ...components);

const ball = createEntity(Position(canvas.width / 2, canvas.height - 30), Velocity(8, -6), Ball(8));
const paddle = createEntity(Position(300, 490), Paddle(100, 10));


//Kreiranje cigli
const brickRowCount = 5;
const brickColumnCount = 9;
const brickWidth = 60;
const brickHeight = 20;
const brickPadding = 10;
const brickOffsetTop = 30;
const brickOffsetLeft = 30;



const bricks = [...Array(brickRowCount)] //niz sa brojem redova
    .map((_, r) =>
        [...Array(brickColumnCount)] //niz sa brojem kolona
            .map((_, c) => {
                const x = brickOffsetLeft + c * (brickWidth + brickPadding);
                const y = brickOffsetTop + r * (brickHeight + brickPadding);
                return createEntity(
                    Position(x, y),
                    Size(brickWidth, brickHeight),
                    Brick(),
                    Status()
                );
            })
    )
    .flat();




let entities = [ball, paddle, ...bricks];
let score = 0;
let lives = 2;

//Taster dogadjaji
const keyState = {};
window.addEventListener('keydown', (e) => (keyState[e.key] = true));
window.addEventListener('keyup', (e) => (keyState[e.key] = false));


//Sistemi
const renderSystem = (entities) => {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    //score
    ctx.font = "16px Arial";
    ctx.fillStyle = "#0095DD";
    ctx.fillText(`Score: ${score}`, 8, 20);

    //lives
    ctx.fillText(`Lives: ${lives}`, canvas.width - 65, 20);


    entities.map((entity) => {
        if (entity.Ball && entity.Position) {
            const { x, y } = entity.Position;
            const radius = entity.Ball.radius;
            ctx.beginPath();
            ctx.arc(x, y, radius, 0, Math.PI * 2);
            ctx.fillStyle = "#0095DD";
            ctx.fill();
            ctx.closePath();
        }

        if (entity.Paddle && entity.Position) {
            const { x, y } = entity.Position;
            const { width, height } = entity.Paddle;
            ctx.fillStyle = "#0095DD";
            ctx.roundRect(x, y, width, height, [20]);
            ctx.stroke();
            ctx.fill();
        }

        if (entity.Brick && entity.Position && entity.Status.active) {
            const { x, y } = entity.Position;
            const { width, height } = entity.Size;
            ctx.fillStyle = "#FF0000";
            ctx.fillRect(x, y, width, height);
        }

        if (entity.Particle && entity.Position) {
            const { x, y } = entity.Position;
            ctx.fillStyle = "rgb(0, 255, 0)";
            ctx.fillRect(x, y, 2, 2);
        }
    });

    return entities;
};

const paddleControlSystem = (entities) =>
    entities.map((entity) => {
        if (entity.Paddle && entity.Position) {
            const speed = 10;
            let newX = entity.Position.x;

            if (keyState['ArrowLeft'] && newX > 0) newX -= speed;
            if (keyState['ArrowRight'] && newX < canvas.width - entity.Paddle.width) newX += speed;

            return { ...entity, Position: { x: newX, y: entity.Position.y } };
        }
        return entity;
    });




const movementSystem = (entities) =>
    entities.map((entity) => {
        if (entity.Ball && entity.Position && entity.Velocity) {
            let { x, y } = entity.Position;
            let { vx, vy } = entity.Velocity;

            //Sudar sa ivicama
            //desna i leva ivica
            if (x + vx > canvas.width - entity.Ball.radius || x + vx < entity.Ball.radius) {
                vx = -vx;
            }
            //gornja ivica
            if (y + vy < entity.Ball.radius) {
                vy = -vy;
            }

            //Sudar sa paddle-om
            const paddle = entities.find((e) => e.Paddle);
            if (
                paddle &&
                x > paddle.Position.x &&
                x < paddle.Position.x + paddle.Paddle.width &&
                y + vy > paddle.Position.y - entity.Ball.radius
            ) {
                vy = -vy;
            }

            //Sudar sa donjom ivicom canvasa
            if (y + vy > canvas.height) {
                lives--;    //akcija

                if (!lives) {
                    alert("Kraj igre!");
                    document.location.reload();
                } else {
                    //resetovanje loptice na pocetnu poziciju i brzinu
                    return {
                        ...entity,
                        Position: { x: canvas.width / 2, y: canvas.height - 30 },
                        Velocity: { vx: vx, vy: -vy }
                    }

                }
            }


            return { ...entity, Position: { x: x + vx, y: y + vy }, Velocity: { vx, vy } };
        }

        return entity;
    });


const particleSystem = (entities) =>
    entities.map((entity) => {
        if (entity.Particle && entity.Position) {
            const { x, y } = entity.Position;
            const { vx, vy, lifetime } = entity.Particle;

            //Azuriranje pozicije i smanjenje trajanja
            const newLifetime = lifetime - 1;
            if (newLifetime > 0) {
                return {
                    ...entity,
                    Position: { x: x + vx, y: y + vy },
                    Particle: { vx, vy, lifetime: newLifetime },
                };
            }
            //Ukloni cesticu ako je lifetime 0
            return null;
        }
        return entity;
    })
    .filter(Boolean);

const collisionSystem = (entities) =>
    entities.reduce((updatedEntities, entity) => {
        if (entity.Ball && entity.Position) {
            const ballPos = entity.Position;
            entities.map((brick) => {
                if (
                    brick.Brick &&
                    brick.Status.active &&
                    ballPos.x > brick.Position.x &&
                    ballPos.x < brick.Position.x + brick.Size.width &&
                    ballPos.y > brick.Position.y &&
                    ballPos.y < brick.Position.y + brick.Size.height
                ) {
                    const vel = entity.Velocity;
                    vel.vy = -vel.vy;
                    brick.Status.active = false;    //akcija
                    score++;

                    //Generisanje cestica (akcija)
                    const particles = createParticle(brick.Position.x + brick.Size.width / 2, brick.Position.y + brick.Size.height / 2);
                    updatedEntities.push(...particles);

                    if (score === brickRowCount * brickColumnCount) {
                        alert("Pobeda!");
                        document.location.reload();
                    }
                }
            });
        }
        updatedEntities.push(entity);
        return updatedEntities;
    }, []);



const systems = [renderSystem, paddleControlSystem, movementSystem, collisionSystem, particleSystem];

const updateGame = (entities, systems) =>
    systems.reduce((currentEntities, system) => system(currentEntities), entities);

start.addEventListener('click', () => {
    function gameLoop() {
        entities = updateGame(entities, systems);
        requestAnimationFrame(gameLoop);
    }
    gameLoop();
    start.disabled = true;
});


/* 
    1. updateGame je funkcija koja koristi reduce metodu niza da primeni sve sisteme na trenutne entitete.

    2. reduce se koristi za iteraciju kroz sve sisteme u nizu i poziva svaki sistem, koji modifikuje stanje igre (entitete)
     i vraća ažurirane entitete.

    3. Na početku, entities predstavlja početno stanje igre (početni entiteti kao što su lopta, paleta, cigle itd.),
     a svaki sistem u nizu izvršava svoje ažuriranje na osnovu tog trenutnog stanja.

    4. U svakom prolazu kroz reduce, trenutna kolekcija entiteta (currentEntities) se ažurira, i na kraju se vraća konačni niz entiteta.





    U ovom projektu, entiteti se koriste kao osnovni objekti ili podaci koji čine stanje igre.
    Entiteti predstavljaju sve objekte u igri (lopta, paleta, cigle, čestice, itd.) i svaki entitet
        ima svoje atribute koji definišu njegov izgled, ponašanje i interakciju sa drugim entitetima.
    Entiteti omogućavaju lakše upravljanje stanjem igre, jer se svi objekti mogu modifikovati i ažurirati kroz sisteme.



    Ciste funkcije:
        -Nemaju nuspojave: Funkcija ne menja stanje van svog opsega (ne menja globalne varijable, ne utiče na spoljne objekte, itd.).
        -Determinističke: Isti ulaz u funkciju uvek daje isti izlaz.
    (movementSystem, collisionSystem, particleSystem)



    Repna rekurzija (Tail Recursion): Rekurzivni poziv je poslednja operacija u funkciji.
    Čelna rekurzija (Head Recursion): Funkcija prvo obrađuje deo problema, a zatim pravi rekurzivni poziv. (nije optimalna)


    Funkcija višeg reda je funkcija koja prima druge funkcije kao argumente ili vraća funkcije kao rezultat.
        1. reduce funkcija
        2. map funkcija u različitim sistemima
        3. filter funkcija
    

    Kompozicija funkcije je proces u kojem se dve ili više funkcija kombinuju kako bi se stvorila nova funkcija,
        pri čemu rezultat jedne funkcije postaje ulaz u sledeću. 
    
    

*/