const mongoose = require("mongoose");

async function connect() {
  try {
    const dbConnection = await mongoose.connect(process.env.MONGODB_URI);
    console.log(
      "Conectado com sucesso com o banco de dados:",
      dbConnection.connection.name
    );
  } catch (error) {
    console.log("Conexão com o banco de dados falhou:", error);
  }
}

module.exports = connect;
