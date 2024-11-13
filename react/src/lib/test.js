// import { CandleData } from './timehash';
import { io } from "socket.io-client";

const socket = io("http://192.46.230.32:6003");

socket.on("connect", () => {
  console.log('connecteds');
});

socket.emit('fck', 'yeah')

// let _candleData = new CandleData('08:21:22');
// console.log(_candleData);
