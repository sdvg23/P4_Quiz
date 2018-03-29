const readline = require('readline');
const cmds = require('./cmds');
//const out = require('./out');
const {log, biglog, errorlog, colorize} = require('./out');

const net = require("net"); //para sockets

//Creamos el socket servidor (param:socjet que nos conecta con el cliente)
net.createServer(socket => {

	console.log("Se ha conectado un cliente desde "+ socket.remoteAddress);
	//Mensaje inicial
	biglog(socket, 'CORE Quiz', 'green');

	const rl = readline.createInterface({
	    input: socket,
	    output: socket,
	    prompt: colorize("quiz > ", 'blue'),
	    completer: (line) => {
	        const completions = 'h help add delete edit list test p play q quit show credits'.split(' ');
	        const hits = completions.filter((c) => c.startsWith(line));
	        return [hits.length ? hits : completions, line];
	    }
	});

	//Cerrar conexion para socket
	socket
	.on("end", () => {rl.close();}) //Cierro readline cuando salir
	.on("error", () => {rl.close();}); //Cierro readline cuando error


	rl.prompt();

	rl
	.on('line', (line) => {
	    let args = line.split(" ");
	    let cmd = args[0].toLowerCase().trim();

	    switch (cmd) {
	        case '':
	            rl.prompt();
	            break;
	        case 'h':
	        case 'help':
	            cmds.helpCmd(socket, rl);
	            break;
	        case 'quit':
	        case 'q':
	            cmds.quitCmd(socket, rl);
	            break;
	        case 'add':
	            cmds.addCmd(socket, rl);
	            break;
	        case 'list':
	            cmds.listCmd(socket, rl);
	            break;
	        case 'show':
	            cmds.showCmd(socket, rl, args[1]);
	            break;
	        case 'test':
	            cmds.testCmd(socket, rl, args[1]);
	            break;
	        case 'play':
	        case 'p':
	            cmds.playCmd(socket, rl);
	            break;
	        case 'delete':
	            cmds.deleteCmd(socket, rl, args[1]);
	            break;
	        case 'edit':
	            cmds.editCmd(socket, rl, args[1]);
	            break;
	        case 'credits':
	            cmds.creditsCmd(socket, rl);
	            break;
	       
	        default:
	            log(socket, `Comando desconocido: '${colorize(cmd, 'red')}'`);
	            log(socket, `Use ${colorize('help', 'green')} para ver todos los comandos disponibles.`);
	            rl.prompt();
	            break;
	        }
	})
	.on('close', () => {
	    log(socket, 'Adiós!');
	    //process.exit(0);
	});

}).listen(3030);

