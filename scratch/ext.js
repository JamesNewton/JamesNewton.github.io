(function(ext) {
	ext._ws = new WebSocket('ws://localhost:3000');
	function onClose() {
		console.log('closed');
		try {
			if (ext._ws) {
				ext._ws = new WebSocket('ws://localhost:3000');
				ext._ws.onclose = onClose;
				console.log('reconnected');
			}
		} catch (e) {
			console.log('disconnected');
			ext._ws = null;
		}
	};
	ext._ws.onclose = onClose;
	ext._shutdown = function() {
		let s = ext._ws;
		ext._ws = null;
		s.close();
	};
	ext._getStatus = function() {
		if (!ext._ws) return {status: 0, msg: 'Disconnected'};
		if (ext._ws.readyState == 1) return {status: 2, msg: 'Connected'};
		if (ext._ws.readyState == 0) return {status: 1, msg: 'Connecting'};
		return {status: 0, msg: 'Not connected'};
	};
	ext._count = 0;
	ext.move_all_joints = function(j1, j2, j3, j4, j5) {
		console.log('a ' + j1 + " " + j2 + " " + j3 + " " + j4 + " " + j5);
		ext._ws.send("1 " + (ext._count++) + " 1 undefined a " + j1 * 3600 + " " + j2 * 3600 + " " + j3 * 3600 + " " + j4 * 3600 + " " + j5 * 3600 + " ;");
	};
	ext.move_to = function(x, y, z, jx, jy, jz, leftRight, upDown, inOut) {
		console.log('M ' + x + ' ' + y + ' ' + z + ' ' + jx + ' ' + jy + ' ' + jz + ' ' + leftRight + ' ' + upDown + ' ' + inOut);
		ext._ws.send(
			"1 " + (ext._count++) + " 1 undefined M "
			+ x * 1000000 + ' ' + y * 1000000 + ' ' + z * 1000000 + ' '
			+ parseInt(jx) + ' '
			+ parseInt(jy) + ' '
			+ parseInt(jz) + ' '
			+ (0 + (leftRight == 'right')) + ' '
			+ (0 + (upDown == 'up')) + ' '
			+ (0 + (inOut == 'out')) + ' '
			+ ';'
		);
	};
	ext.reload = function() {
		console.log('reload');
		try {
			ext._ws = new WebSocket('ws://localhost:3000');
			ext._ws.onclose = onClose;
		} catch (e) {}
	}; 
	var descriptor = {
		blocks: [
			[' ', 'move all joints j1: %n j2: %n j3: %n j4: %n j5: %n', 'move_all_joints', 0, 0, 135, 45, 0],
			[' ', 'move to x: %n y: %n z: %n direction x: %m.dexDirDirs y: %m.dexDirDirs z: %m.dexDirDirs config: %m.dexLeftRight %m.dexUpDown %m.dexInOut', 'move_to', 0, 0.5, 0.075, '0', '0', '-1', 'right', 'up', 'out'],
			[' ', 'reload', 'reload']
		],
		menus: {
			dexDirDirs: ['-1', '0', '1'],
			dexLeftRight: ['left', 'right'],
			dexUpDown: ['up', 'down'],
			dexInOut: ['in', 'out']
		}
	};
	ScratchExtensions.register('Dexter', descriptor, ext);
})({});
