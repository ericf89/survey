let userAnswer;
export default function (SequelizeInst) {
    if (!userAnswer) {
        userAnswer = SequelizeInst.define('userAnswer', {});
    }
    return userAnswer;
}
