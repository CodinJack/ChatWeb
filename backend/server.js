const express = require("express")
const cors = require("cors")
const mongoose = require("mongoose")

require("dotenv").config();

const app = express();
const PORT = 5000
const path = require("path");

app.use(cors);
app.use(express.json());

const url = "mongodb+srv://jaikhanna615:xQ9EPYcArWbjx7aK@chatcluster.fxx8b1c.mongodb.net/?retryWrites=true&w=majority&appName=ChatCluster"

const connect = mongoose
  .connect(uri, {
    useNewUrlParser: true,
    useCreateIndex: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log('MongoDB Connected...'))
  .catch((err) => console.log(err));

const server = require('http').createServer(app);
const io = require('socket.io')(server);

io.on('connection', (socket) => {
    socket.on('Sent Message', (payload) => {
      //store in db
      connect.then((db) => {
        try {
          const chat = new Chat({
            message: payload.message,
            sender: payload.userId,
          });
          chat.save((err, data) => {
            if (err) return res.json({ success: false, err });
            Chat.find({ _id: data._id })
              .populate('sender')
              .exec((err, data) => {
                return io.emit('Received Message', data);
              });
          });
        } catch (err) {
          console.log(err);
        }
      });
    });
  });

  const users = require('./routes/users');
  const chat = require('./routes/chat');
  
  app.use('/users', users);
  app.use('/chat', chat);
  
  // Serve static assets if in production
  if (process.env.NODE_ENV === 'production') {
    // Set static folder
    app.use(express.static('client/build'));
  
    // index.html for all page routes
    app.get('*', (req, res) => {
      res.sendFile(path.resolve(__dirname, 'client', 'build', 'index.html'));
    });
  }
  
  server.listen(port, () => {
    console.log(`Server is running on port: ${port}`);
  });
  
  