import fs from "fs";

const regex = [
	{'regex': /(\s*\?\s*\w+\s*):(\s*\w+;?)/gmui, 'replace': '$1^%$%^$2'},
	
	{'regex': /<\w+\s*\|\s*\w+>/gmui, 'replace': ''},									// <void | string>
	{'regex': /<\w+(<\w+(\[\])?>)?(\[\])?>\s*/gmui, 'replace': ''},						// <Promise<string[]>>
	{'regex': /\??:\s{0,2}(\w+(\.|<))?\w+(\[\])?>?\s*(=|\{)/gmui, 'replace': ' $4'},	// : String<any> =
																						// : string =
																						// : String.string =
	{'regex': /:\s*\w+(\[\])?;/gmui, 'replace': ';'},									// : String;
	{'regex': /=\s*<\w+>\s*/gmui, 'replace': '= '},										// = <String>
	{'regex': /(\(\w+):\s*\w+(\[\])?(\s*,)/gmui, 'replace': '$1$3'},					// (message: Message,
	{'regex': /(\s*,\s*\w+):\s*\w+(\[\])?\)/gmui, 'replace': '$1)'},					// , args: string[])
	{'regex': /\((\w+\s*):\s*\w+(\[\])?\)/gmui, 'replace': '($1)'},						// (args: string[])
	{'regex': /(\w+)\s*\?:\s*\w+(\[\])?/gmui, 'replace': '$1'},							// args?: string[]
	{'regex': /(,\s*\w+\s*):\s*\w+(\[\])?(,.+)/gmui, 'replace': '$1$3'},				// args, command: string,
	{'regex': /(,\s*\w+\s*):\s*\w+(\[\])?(,.+)/gmui, 'replace': '$1$3'},				// args, command: string,
	{'regex': /(\w+\s*):\s*\w+(\[\])?\s*(,.+)/gmui, 'replace': '$1$3'},					// let wait: number, finished;
	{'regex': /(\w+\s*):\s*\w+(\[\])?\s*(,.+)/gmui, 'replace': '$1$3'},					// let wait: number, finished;
	{'regex': /(\w+\s*):\s*\w+(\[\])?\s*(,.+)/gmui, 'replace': '$1$3'},					// let wait: number, finished;

	{'regex': /abstract class/gmui, 'replace': 'class'},								// abstract class
	{'regex': /public\s*abstract\s*/gmui, 'replace': ''},								// public abstract
	{'regex': /public\s*(\w+\s*=)/gmui, 'replace': '$1'},								// public name;

	{'regex': /\^%\$%\^/gmui, 'replace': ':'},
]

const inputDir: string = `${__dirname}/src/ts-built`;
const outputDir: string = `${__dirname}/src/js-built`;

const dirs: string[] = [inputDir];

for (let dir of dirs) {

	try {
		fs.statSync(dir.replace(inputDir, outputDir));
	} catch(e) {
		fs.mkdirSync(dir.replace(inputDir, outputDir));
	}

	const files: string[] = fs.readdirSync(dir);

	for (let file of files) {
		const stats = fs.lstatSync(`${dir}/${file}`)
		
		if (stats.isDirectory()) {
			dirs.push(`${dir}/${file}`);

		} else {
			let content: string = fs.readFileSync(`${dir}/${file}`).toString();
			for (let object of regex) {
				const reg: RegExp = object.regex;
				const replace: string = object.replace;
				content = content.replace(reg, replace);
			}

			fs.writeFileSync(
				`${dir.replace(inputDir, outputDir)}/${file.replace(/\.ts$/gmui, '.js')}`,
				content
			)
		}
	}

}