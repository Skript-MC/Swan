class Sanction {

	constructor(victim, reason) {
		this.victim = victim;
		this.reason = reason;
	}

	from(author) {
		this.author = author;
		return this;
	}

	during(time) {
		this.time = time;
		return this;
	}

	withRole(role) {
		this.role = role;
		if (this.victim) {
			if ((this.victim) && (!this.victim.roles.find(role => role.id === this.role.id))) {
				this.victim.addRole(this.role);
			}
		}
		return this;
	}

}

export default Sanction;