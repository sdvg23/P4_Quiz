const model = require('./model');
//const out = require('./out');
const {log, biglog, errorlog, colorize} = require('./out');

/**
*Muestra la ayuda.
*
*@param rl - Objeto readline usado para implementar el CLI.
*/
exports.helpCmd = rl => {
    log("Comandos:");
    log("    h|help - Muestra esta ayuda.");
    log("    list - Listar los quizzes existentes.");
    log("    show <id> - Muestra la pregunta y respuesta del quiz indicado.");
    log("    add - Añadir un nuevo quiz interactivamente.");
    log("    delete <id> - Borrar el quiz indicado.");
    log("    edit <id> - Editar el quiz indicado.");
    log("    test <id> - Probar el quiz indicado.");
    log("    p|play - Jugar a preguntar aleatoriamente todos los quizzes.");
    log("    credits - Créditos.");
    log("    q|quit - Salir del programa.");
    rl.prompt();
};

/**
*Lista todos los quizzes existentes en el modelo.
*
*@param rl - Objeto readline usado para implementar el CLI.
*/
exports.listCmd = rl => {
    log('Quizzes existentes:', 'red');
    model.getAll().forEach((quiz, id) => {
        log(` [${colorize(id, 'magenta')}]: ${quiz.question}`);
    }); //imprime por pantalla cada uno de los quizzes
    rl.prompt();
};

/**
*Muestra el quiz indicado en el parámetro: pregunta y respuesta.
*
*@param rl - Objeto readline usado para implementar el CLI.
*@param id - clave que identifica el quiz a mostrar.
*/
exports.showCmd = (rl, id) => { 
    if (typeof id === "undefined"){
        errorlog(`Falta el parámetro id.`);
    } else {
        try{
            const quiz = model.getByIndex(id);
            log(` [${colorize(id, 'magenta')}]: ${quiz.question} ${colorize('=>', 'magenta')} ${quiz.answer}`);
        } catch(error) {
            errorlog(error.message);
        }
    }
    rl.prompt();
};

/**
*Añade un nuevo quiz al modelo.
*Pregunta interactivamente por la pregunta y la respuesta.
*
*@param rl - Objeto readline usado para implementar el CLI.
*/
exports.addCmd = rl => {
    rl.question(colorize(' Introduzca una pregunta: ', 'red'), question => {
        rl.question(colorize(' Introduzca la respuesta: ', 'red'), answer => {
            model.add(question, answer);
            log(` ${colorize('Se ha añadido', 'magenta')}: ${question} ${colorize('=>', 'magenta')} ${answer}`);
            rl.prompt();
        });
    });
};

/**
*Borra un quiz del modelo.
*
*@param rl - Objeto readline usado para implementar el CLI.
*@param id - clave que identifica el quiz a borrar.
*/
exports.deleteCmd = (rl, id) => {
    if (typeof id === "undefined"){
        errorlog(`Falta el parámetro id.`);
    } else {
        try{
            model.deleteByIndex(id);
        } catch(error) {
            errorlog(error.message);
        }
    }   
    rl.prompt();
};

/**
*Edita un quiz del modelo.
*
*@param rl - Objeto readline usado para implementar el CLI.
*@param id - clave que identifica el quiz a editar.
*/
exports.editCmd = (rl, id) => {
    if (typeof id === "undefined"){
        errorlog(`Falta el parámetro id.`);
        rl.prompt();
    } else {
        try{
            const quiz = model.getByIndex(id);
            process.stdout.isTTY && setTimeout(() => {rl.write(quiz.question)}, 0);
            rl.question(colorize(' Introduzca una pregunta: ', 'red'), question => {
                process.stdout.isTTY && setTimeout(() => {rl.write(quiz.answer)}, 0);
                rl.question(colorize(' Introduzca la respuesta: ', 'red'), answer => {
                    model.update(id, question, answer);
                    log(` Se ha cambiado el quiz ${colorize(id, 'magenta')} por: ${question} ${colorize('=>', 'magenta')} ${answer}`);
                    rl.prompt();
                });
            });
        } catch(error) {
            errorlog(error.message);
            rl.prompt();
        }
    }  
};

/**
*Prueba un quiz. Hace una pregunta que debemos contestar.
*
*@param rl - Objeto readline usado para implementar el CLI.
*@param id - clave que identifica el quiz a probar.
*/
exports.testCmd = (rl, id) => {
    if (typeof id === "undefined"){
        errorlog(`Falta el parámetro id.`);
        rl.prompt();
    } else {
        try{
            const quiz = model.getByIndex(id); //obtenemos la pregunta
            rl.question(colorize(`${quiz.question} `, 'red'), answer => {
                let answ = answer.toLowerCase().trim();      //Quito los espacios en blanco a der. e izq. del string answer y paso a minúsculas
                if(answ === quiz.answer.toLowerCase()){     //Comparo con la respuesta pasada a minúsculas también
                    log('Su respuesta es correcta.');
                } else {
                    log('Su respuesta es incorrecta.');
                }
                rl.prompt();
            });
        } catch(error) {
            errorlog(error.message);
            rl.prompt();
        }
    } 
};

/**
*Pregunta todos los quizzes existentes en el modelo en orden aleatorio.
*Se gana si se contesta bien a todos.
*
*@param rl - Objeto readline usado para implementar el CLI.
*/
exports.playCmd = rl => {
    let score = 0;                                      //número de preguntas acertadas
    let toBeResolved = [];                              //array de las preguntas que quedan por contestar
    model.getAll().forEach((quiz, id) => {
        toBeResolved.push(id);                          //meto en el array todos los id existentes  
    });
    let tBRl = toBeResolved.length;
    const playOne = () => {
        if (toBeResolved.length <= 0){
            log('No hay nada más que preguntar.');
            log('Fin del examen. Aciertos: ');
            biglog(score, 'magenta');
            rl.prompt();
        } else {
            const findId = () => {                         //función que devuelve un valor random que esté en el array {0-tamaño array}
                let rand = Math.round(Math.random()*tBRl);
                while (!toBeResolved.includes(rand)){
                    rand = Math.round(Math.random()*tBRl);
                }
                return rand;
            };
            let id = findId();
            toBeResolved.splice(toBeResolved.indexOf(id), 1);                                     //elimino del array la POS de ese ID   , no el id en sí.                                
            let quiz = model.getByIndex(id);                                //pregunta asociada a ese id random
            rl.question(colorize(`${quiz.question} `, 'red'), answer => {
                let answ = answer.toLowerCase().trim();                         
                if(answ === quiz.answer.toLowerCase()){                         
                    log('Su respuesta es correcta.');
                    score++;
                    log(`Lleva ${score} aciertos.`);
                    playOne();
                } else {
                    log('Su respuesta es incorrecta.');
                    log('Fin del examen. Aciertos: ');
                    biglog(score);
                    rl.prompt();
                }
            });         
        }
    };
    playOne();
};

/**
*Muestra los nombres de los autores de la práctica.
*
*@param rl - Objeto readline usado para implementar el CLI.
*/
exports.creditsCmd = rl => {
    log('Autores de la práctica', 'blue');
    log('sdvg23', 'green');
    rl.prompt();
};

/**
*Terminar el programa.
*
*@param rl - Objeto readline usado para implementar el CLI.
*/
exports.quitCmd = rl => {
    rl.close();
};