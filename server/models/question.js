import Sequelize from 'sequelize';

let Question;
export default function (SequelizeInst) {
    if (!Question) {
        Question = SequelizeInst.define('question', {
            prompt: { type: Sequelize.STRING },
            multiAnswer: { type: Sequelize.BOOLEAN },
        });
    }
    return Question;
}
