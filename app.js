import express from "express"; // นำเข้าโมดูล express
import bodyParser from "body-parser"; // นำเข้า body-parser middleware
import ejs from "ejs"; // นำเข้า EJS template engine
import _ from "lodash"; // นำเข้า lodash สำหรับการจัดการข้อความ
import nodemailer from "nodemailer"; // นำเข้า nodemailer สำหรับการส่งอีเมล
import path from "path"; // นำเข้า path สำหรับการจัดการเส้นทางไฟล์
import Swal from "sweetalert2/dist/sweetalert2.all.min.js"; // นำเข้า sweetalert2 สำหรับการแสดงป๊อปอัพ

const homeStartingContent = "Hi Everyone."; // ข้อความเริ่มต้นของหน้าแรก
const aboutTitle = "About Me"; // ชื่อหัวข้อของหน้า About
const contactTitle = "Contact"; // ชื่อหัวข้อของหน้า Contact
const notification = ""; // ตัวแปรสำหรับการแสดงการแจ้งเตือน

const app = express(); // สร้างแอปพลิเคชัน Express
const port = 3000; // กำหนดพอร์ตที่เซิร์ฟเวอร์จะทำงาน

app.set("view engine", "ejs"); // กำหนด EJS เป็น template engine

// ใช้ body-parser middleware สำหรับจัดการกับข้อมูลที่ส่งมาจากฟอร์ม
app.use(bodyParser.urlencoded({ extended: true }));
// ใช้ express.static middleware เพื่อเสิร์ฟไฟล์ static จากโฟลเดอร์ "public"
app.use(express.static("public"));

let posts = []; // ตัวแปรสำหรับเก็บข้อมูลโพสต์

// Route สำหรับหน้าแรก
app.get("/", function (req, res) {
  res.render("home", {
    startingContent: homeStartingContent, // ส่งข้อความเริ่มต้นไปยัง home.ejs
    posts: posts, // ส่งข้อมูลโพสต์ทั้งหมดไปยัง home.ejs
  });
});

// Route สำหรับหน้า About
app.get("/about", function (req, res) {
  res.render("about", {
    title: aboutTitle, // ส่งชื่อหัวข้อไปยัง about.ejs
    aboutTitle: aboutTitle, // ส่งชื่อหัวข้อไปยัง about.ejs
  });
});

// Route สำหรับหน้า Compose (สร้างโพสต์ใหม่)
app.get("/compose", function (req, res) {
  res.render("compose"); // แสดงฟอร์มสร้างโพสต์ใหม่
});

// Route สำหรับการโพสต์ข้อมูลใหม่
app.post("/compose", function (req, res) {
  const post = {
    subject: req.body.postSubject, // หัวข้อของโพสต์
    title: req.body.postTitle, // ชื่อของโพสต์
    content: req.body.postBody, // เนื้อหาของโพสต์
  };
  posts.push(post); // เพิ่มโพสต์ใหม่ไปยังอาร์เรย์โพสต์
  res.redirect("/"); // เปลี่ยนเส้นทางไปยังหน้าแรก
});

// Route สำหรับการดูรายละเอียดโพสต์
app.get("/posts/:postName", function (req, res) {
  const requestedTitle = _.lowerCase(req.params.postName); // แปลงชื่อโพสต์ที่ร้องขอเป็นตัวพิมพ์เล็ก

  posts.forEach(function (post) {
    const storedTitle = _.lowerCase(post.title); // แปลงชื่อโพสต์ที่จัดเก็บเป็นตัวพิมพ์เล็ก
    if (storedTitle === requestedTitle) {
      // เปรียบเทียบชื่อโพสต์
      res.render("post", {
        subject: post.subject, // ส่งหัวข้อโพสต์ไปยัง post.ejs
        title: post.title, // ส่งชื่อโพสต์ไปยัง post.ejs
        content: post.content, // ส่งเนื้อหาโพสต์ไปยัง post.ejs
      });
    }
  });
});

// Route สำหรับหน้า Edit (แก้ไขโพสต์)
app.get("/edit/:postName", function (req, res) {
  const requestedTitle = _.lowerCase(req.params.postName); // แปลงชื่อโพสต์ที่ร้องขอเป็นตัวพิมพ์เล็ก

  posts.forEach(function (post) {
    const storedTitle = _.lowerCase(post.title); // แปลงชื่อโพสต์ที่จัดเก็บเป็นตัวพิมพ์เล็ก
    if (storedTitle === requestedTitle) {
      // เปรียบเทียบชื่อโพสต์
      res.render("edit", { post: post }); // ส่งข้อมูลโพสต์ไปยัง edit.ejs
    }
  });
});

// Route สำหรับการอัปเดตโพสต์ที่มีอยู่
app.post("/edit/:postName", function (req, res) {
  const requestedTitle = _.lowerCase(req.params.postName); // แปลงชื่อโพสต์ที่ร้องขอเป็นตัวพิมพ์เล็ก

  posts.forEach(function (post, index) {
    const storedTitle = _.lowerCase(post.title); // แปลงชื่อโพสต์ที่จัดเก็บเป็นตัวพิมพ์เล็ก
    if (storedTitle === requestedTitle) {
      // เปรียบเทียบชื่อโพสต์
      posts[index] = {
        subject: req.body.postSubject, // อัปเดตหัวข้อโพสต์
        title: req.body.postTitle, // อัปเดตชื่อโพสต์
        content: req.body.postBody, // อัปเดตเนื้อหาโพสต์
      };
      res.redirect("/posts/" + _.lowerCase(req.body.postTitle)); // เปลี่ยนเส้นทางไปยังโพสต์ที่อัปเดต
    }
  });
});

// Route สำหรับการลบโพสต์
app.get("/delete/:postName", function (req, res) {
  const requestedTitle = _.lowerCase(req.params.postName); // แปลงชื่อโพสต์ที่ร้องขอเป็นตัวพิมพ์เล็ก

  posts = posts.filter(function (post) {
    return _.lowerCase(post.title) !== requestedTitle; // กรองโพสต์ที่ไม่ตรงกับชื่อที่ต้องการลบ
  });

  res.redirect("/");// เปลี่ยนเส้นทางไปยังหน้าแรก
});


app.listen(port, () => {
  console.log(`Server starting on port ${port}`);
});
