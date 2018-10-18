/* eslint-disable */
const socket = io.connect('http://localhost:3000');
const userId = 1;
(() => {
    socket.on(`notification-${userId}`, data => console.log(data));
})();