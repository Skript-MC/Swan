class Poll {
	constructor (name, description, author, time) {
		this.name = name;
		this.description = description;
		this.author = author;
		this.time = time;
	}

	getName () {
		return this.name;
	}

	setName (name) {
		this.name = name;
	}

	getDescription () {
		return this.description;
	}

	setDescription (description) {
		this.description = description;
	}

	getAuthor () {
		return this.author;
	}

	setAuthor (author) {
		this.author = author;
	}

	getTime () {
		return this.time;
	}

	setTime (time) {
		this.time = time;
	}
}

export default Poll;
