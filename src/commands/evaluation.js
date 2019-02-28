import Discord from "discord.js";

export default {

	regex: 'eval(uation)?|check|v(é|e)rifi(e(z|r))',

	execute: async message => {
		let args = message.content.toLowerCase().split(" ");

		if (args[0]) {

			let errors =  {
				wrongVars: [],
				wrongUseVars: [],
				events: {
					every: []
				}
			};
			code = args.join(" ");
			while (code.includes("```")) {
				code = code.replace("```", "");
			}

			code = code.replace("```vb", "")
				.replace("```py", "")
				.replace("```python", "")
				.replace("``", "");

			lines = code.split("\n");
			while (lines.includes("")) {
				for (i = 0; i < lines.length; i++) {
					if (lines[i] === "") lines.splice(i, 1);
				}
			}

			for (i = 0; i < lines.length; i++) {
				while (lines[i].includes("\t") || /^ /.test(lines[i])) {
					lines[i] = lines[i].replace("\t", "").replace(/^ /, "");
				}

				if (/\{([a-zA-Z0-9 _]+|\w+)\.([a-zA-Z0-9 _]+|\w+)\}/gm.test(lines[i])) {
					errors.wrongVars.push(" - Ligne **" + i + "**: " + lines[i]);
				}

				if (/set {[a-zA-Z0-9 _.]+} to (true|false)/gm.test(lines[i])) {
					errors.wrongUseVars.push(" - Ligne **" + i + "**: " + lines[i]);
				}

				if (/(on )?every ([0-9] )?(second|minute|hour|day|year)s?/gm.test(lines[i])) {
					errors.events.every.push(" - Ligne **" + i + "**: " + lines[i]);
				}

			}

			if (
				errors.wrongVars.length === 0
				&& errors.wrongUseVars.length === 0	
				&& errors.events.every.length === 0	
			) {
				message.channel.send(succes("Code bon", "Votre code semble être propre ✅"));
			} else {
				let error = "";
				if (errors.wrongVars.length > 0) error += "**Mauvaises variables:**\n\n" + errors.wrongVars.join("\n") + "\n";
				if (errors.wrongUseVars > 0) error += "\n" + "**Mauvaises utilisations de variables:**\n\n" + errors.wrongUseVars.join("\n") + "\n";
				if (errors.events.every > 0) error += "\n" + "**Mauvais event:**\n\n" + errors.events.every.join("\n") + "\n";
				return new Discord.RichEmbed()
					.setTitle("Evaluation")
					.setColor("#f44242")
					.setDescription("Votre code semble mauvais. Vous pouvez l'améliorer:\n\n" + error)
					.setFooter("Executé par " + message.author.username);
			}

		} else {
			return message.channel.send(erreur(config["evaluation"]["besoin code"]));
		}

	}

}
