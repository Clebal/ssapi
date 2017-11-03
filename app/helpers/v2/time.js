module.exports.getFecha = () => {
	var date = new Date();
	return date.getDate() + '/' + (date.getMonth() + 1);
};

module.exports.getCurrentTime = () => {
	var date = new Date();
	var totalTime = date.getHours() * 60 + date.getMinutes();
	var hours = Math.floor(totalTime/60);
	var minutes = totalTime - (hours*60);
	return hours + ":" + minutes;
};

module.exports.convertToTime = (hora) => {
	hora = hora.split(":");
	var totalTime = (hora[0] * 60) + parseInt(hora[1]);
	return totalTime;
};

module.exports.getUnixTime = (hora, fecha) => {
	var date = fecha.split("/");
	return Date.parse(date[1]+"/"+date[0]+"/2017 "+hora) / 1000;
};
