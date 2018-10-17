/* eslint-disable */
const socket = io.connect('http://localhost:3000');

(() => {
    socket.on(`notification-${userId}`, data => console.log(data));
})();