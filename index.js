// const myPromise = () =>
//   new Promise((res, rej) => {
//     console.log("hey");
//   });
// document.getElementById("buttonx").addEventListener("click", () => {
//   // new Promise((res, rej) => {
//   //   res(myPromise);
//   // }).then((pro) => pro());
//   console.log(Promise.resolve(myPromise).then((x) => x()));
// });

// const myPromise = new Promise((res, rej) => {
//   console.log("hey");
// });

// document.getElementById("buttonx").addEventListener("click", () => {
//   console.log(Promise.resolve(myPromise));
// });

// so in web console why this my promise get resolved directly whitout calling it
console.log("first");
let a = 0;
for (; a < 10; a++) {
  setTimeout(function app() {
    console.log(a);
  }, 2000);
}
