const Pusher = require('pusher');

//connecting to the pusher
const pusher = new Pusher({
	appId: '761913',
	key: 'f9126fc42e7cc112a924',
	secret: '937186b271b1422dc5a1',
	cluster: 'ap2',
	useTLS: true
});

module.exports = pusher;