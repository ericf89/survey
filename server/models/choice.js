import Sequelize from 'sequelize';

let Choice;
export default function (SequelizeInst) {
    if (!Choice) {
        Choice = SequelizeInst.define('choice', {
            value: { type: Sequelize.STRING },
        });
    }
    return Choice;
}
