let UserAnswer;
export default function (SequelizeInst) {
    if (!UserAnswer) {
        UserAnswer = SequelizeInst.define('userAnswer', {});
    }
    return UserAnswer;
}
