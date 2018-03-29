const figlet = require('figlet');
const chalk = require('chalk');

/**
*Dar color a un string.
*
*@param msg - string al que hay que darle color.
*@param color - color para pintar el msg.
*@returns {string} - msg con el color indicado.
*/
const colorize = (msg, color) => {
    if (typeof color !== "undefined"){
        msg = chalk[color].bold(msg);
        //msg = chalk.green.bold(msg);
    }
    return msg;
};


/**
*Escribe un mensaje de log.
*
*@param msg - string a escribir.
*@param color - color del texto.
*/
const log = (socket, msg, color) => {
    socket.write(colorize(msg, color)+"\n");
};

/**
*Escribe un mensaje de log grande.
*
*@param msg - string a escribir.
*@param color - color del texto.
*/
const biglog = (socket, msg, color) => {
    log(socket, colorize(figlet.textSync(msg, { horizontalLayout: 'full'}), color));
};

/**
*Escribe el mensaje de error emsg.
*
*@param emsg - texto del mensaje de error.
*/
const errorlog = (socket, emsg) => {
    socket.write(`${colorize("Error", "red")}: ${colorize(colorize(emsg, "red"), "bgYellowBright")}\n`);
};

exports = module.exports = {
    colorize,
    log,
    biglog,
    errorlog
};
