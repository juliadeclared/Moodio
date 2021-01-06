const Sequelize = require("sequelize");
const { get } = require("../api");
const db = require("./database");
const crypto = require("crypto");

const User = db.define("user", {
	// firstName: Sequelize.STRING,
	// lasttName: Sequelize.STRING,
	email: {
		type: Sequelize.STRING,
		allowNull: false,
		unique: true,
	},
	password: {
		type: Sequelize.STRING,
		allowNull: false,
		get() {
			return () => this.getDataValue("password");
		},
	},
	salt: {
		type: Sequelize.STRING,
		// Making `.salt` act like a function hides it when serializing to JSON.
		// This is a hack to get around Sequelize's lack of a "private" option.
		get() {
			return () => this.getDataValue("salt");
		},
	},
	googleId: Sequelize.STRING,
});

//instance methods:
User.prototype.correctPassword = function (enteredPwd) {
	return User.encryptPassword(enteredPwd, this.salt()) === this.password();
};

//class methods:
User.generateSalt = function () {
	return crypto.randomBytes(16).toString("base64");
};
User.encryptPassword = function (plainText, salt) {
	return crypto
		.createHash("RSA-SHA256")
		.update(plainText)
		.update(salt)
		.digest("hex");
};

//hooks:
const setSaltAndPassword = (user) => {
	if (user.changed("password")) {
		user.salt = User.generateSalt();
		user.password = User.encryptPassword(user.password(), user.salt());
	}
};

User.beforeCreate(setSaltAndPassword);
User.beforeUpdate(setSaltAndPassword);
User.beforeBulkCreate((users) => {
	users.forEach(setSaltAndPassword);
});

module.exports = User;
