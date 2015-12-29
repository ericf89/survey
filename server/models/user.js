import Sequelize from 'sequelize';

let User;
export default function (SequelizeInst) {
    if (!User) {
        User = SequelizeInst.define('user', {
            username: { type: Sequelize.STRING, unique: true },
            password: { type: Sequelize.STRING },
        });
    }
    return User;
}
