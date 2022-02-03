<script>
	let nameInput; // for focus states

	let posts;
	let name = "";
	let desc = "";

	let userFiles = [];

	let adminEmail = "";

	let newName = "";

	let profilePic =
		"https://upload.wikimedia.org/wikipedia/commons/8/89/Portrait_Placeholder.png";

	let chatOrTodo = "chat";

	let newChannel = "";
	let channels = [];
	let channelData = "";
	let channelPeople = [];

	let allChannelData = [];

	let availableMentions = [];
	let showMentionPanel = false;

	let activeChannel = "null";

	let newEmail = "";

	let oldPassword = "";
	let newPassword = "";

	let completedTodos = [];
	let todos = [];

	let signedIn = false;

	let errorMsg = "";

	let email = "";
	let pass = "";

	let deleting = false;

	let opened = false;

	import { createClient } from "@supabase/supabase-js";
	import { element } from "svelte/internal";

	export const supabase = createClient(
		"https://tymaawbbrmoeljisdgry.supabase.co",
		"eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJyb2xlIjoiYW5vbiIsImlhdCI6MTY0MTI2Nzc0OCwiZXhwIjoxOTU2ODQzNzQ4fQ.wzGimQFfkYZVvDQrT-fG5RTjDZhEBcGbYG6OVyWrNQs"
	);

	let userSess = supabase.auth.user();

	let peopleStatusChannel = [];

	async function getData() {
		const res2 = await supabase.from("channels").select("*");
		await downloadProfilePic();
		//channels = [];
		channelData = "";
		channelPeople = [];
		allChannelData = [];

		const userData = await supabase.from("users").select("*");
		for (let i in res2.data) {
			if (res2.data[i].name == activeChannel) {
				channelData = res2.data[i].access;
				for (let j in userData.data) {
					if (res2.data[i].access.includes(userData.data[j].email)) {
						if (userData.data[j].name != null) {
							channelPeople = [
								...channelPeople,
								userData.data[j].name,
							];
							peopleStatusChannel = [
								...peopleStatusChannel,
								userData.data[j].status,
							];
							allChannelData = [
								...allChannelData,
								userData.data[j],
							];
						}
					}
				}
				console.log(channelPeople);
			}
		}

		channels = [];
		for (let i in res2.data) {
			if (res2.data[i].access.includes(userSess.email)) {
				channels = [...channels, res2.data[i].name];
			}
		}

		if (activeChannel != "null") {
			const res = await supabase
				.from("posts")
				.select("*")
				.eq("channel", activeChannel)
				.order("id");
			posts = res.data;
			const latestPost = await supabase
				.from("posts")
				.select("*")
				.order("id", { ascending: false });

			console.log(latestPost);

			let s2 = null;

			const nameMentions = await supabase
				.from("users")
				.select("*")
				.eq("email", userSess.email);

			console.log(nameMentions);
			if (nameMentions.data.length != 0) {
				if (nameMentions.data[0].name != null) {
					s2 = "@".concat(nameMentions.data[0].name);
				}
			}

			let s = '@"'.concat(userSess.email, '"');

			//console.log(latestPost.data[0].name)
			console.log(s);
			if (
				latestPost.data.length != 0 &&
				latestPost.data[0].name != null
			) {
				if (
					latestPost.data[0].name.includes(s) ||
					latestPost.data[0].description.includes(s) ||
					latestPost.data[0].name.includes(s2)
				) {
					console.log("mentioned");
					Notification.requestPermission();
					let newNotif = new Notification(
						`You got mentioned in ${latestPost.data[0].channel} (click to open)!`,
						{
							body: `${latestPost.data[0].name}`,
						}
					);
					newNotif.addEventListener("click", function () {
						window.open(`/`);
					});
					console.log("mentioned");
				}
			}
			todos = [];
			const res2 = await supabase
				.from("todos")
				.select("*")
				.eq("channel", activeChannel)
				.eq("completed", false)
				.order("id");

			todos = res2.data;
			completedTodos = [];
			const res3 = await supabase
				.from("todos")
				.select("*")
				.eq("channel", activeChannel)
				.eq("completed", true)
				.order("id");
			completedTodos = res3.data;
		} else {
			const res = await supabase
				.from("posts")
				.select("*")
				.eq("channel", "null")
				.order("id");
			posts = res.data;

			const latestPost = await supabase
				.from("posts")
				.select("*")
				.order("id", { ascending: false });

			console.log(latestPost);

			let s2 = null;

			const nameMentions = await supabase
				.from("users")
				.select("*")
				.eq("email", userSess.email);

			console.log(nameMentions);
			if (nameMentions.data.length != 0) {
				if (nameMentions.data[0].name != null) {
					s2 = "@".concat(nameMentions.data[0].name);
				}
			}

			let s = '@"'.concat(userSess.email, '"');

			console.log(latestPost.data[0].name);
			console.log(s);
			if (
				latestPost.data.length != 0 &&
				latestPost.data[0].name != null
			) {
				if (
					latestPost.data[0].name.includes(s) ||
					latestPost.data[0].description.includes(s) ||
					latestPost.data[0].name.includes(s2)
				) {
					console.log("mentioned");
					Notification.requestPermission();
					let newNotif = new Notification(
						`You got mentioned in ${
							latestPost.data[0].channel != "null"
								? latestPost.data[0].channel
								: "Public Chat"
						} (click to open)!`,
						{
							body: `${latestPost.data[0].name}`,
						}
					);
					newNotif.addEventListener("click", function () {
						window.open(`/`);
					});
					console.log("mentioned");
				}
			}
			todos = [];
			const res2 = await supabase
				.from("todos")
				.select("*")
				.eq("channel", "null")
				.eq("completed", false)
				.order("id");
			todos = res2.data;
			completedTodos = [];
			const res3 = await supabase
				.from("todos")
				.select("*")
				.eq("channel", "null")
				.eq("completed", true)
				.order("id");

			completedTodos = res3.data;
		}
	}

	async function updateTodo(newValue, todoName) {
		await supabase
			.from("todos")
			.update({
				completed: newValue,
			})
			.eq("name", todoName);
	}

	async function addPost(channelName) {
		if (name == "") {
			errorMsg = "Please enter your message!";
			setTimeout(() => {
				errorMsg = "";
			}, 1500);
		} else {
			//console.log(profilePic)
			showMentionPanel = false;
			let postDate = new Date();
			let postMinutes = postDate.getMinutes();
			let postHours = postDate.getHours();
			let amPm = " AM";
			let addOn = "";
			if (postMinutes < 10) {
				addOn = "0";
			}
			if (postHours > 12) {
				postHours -= 12;
				amPm = " PM";
			} else if (postHours == 12) {
				amPm = " PM";
			} else if (postHours == 0) {
				postHours += 12;
			}

			let valueForName = null;

			const { data, error } = await supabase
				.from("users")
				.select()
				.eq("email", userSess.email);
			//console.log(data);
			if (data.length != 0) {
				if (data[0].name != null) {
					valueForName = data[0].name;
				}
			}

			await supabase.from("posts").insert([
				{
					name: name,
					description: desc,
					email: userSess.email,
					channel: channelName,
					profilePicture: profilePic,
					createdAt:
						postDate.getMonth() +
						1 +
						"/" +
						postDate.getDate() +
						" " +
						postHours +
						":" +
						addOn +
						postMinutes +
						amPm,
					personName: valueForName,
				},
			]);
			name = "";
			desc = "";
		}
	}

	async function addTodo(channelName) {
		if (name == "") {
			errorMsg = "Please enter a name!";
			setTimeout(() => {
				errorMsg = "";
			}, 1500);
		} else {
			await supabase.from("todos").insert([
				{
					name: name,
					completed: false,
					channel: channelName,
					email: userSess.email,
				},
			]);
			name = "";
		}
	}

	async function addChannel() {
		if (newChannel == "") {
			errorMsg = "Please enter a channel name!";
			setTimeout(() => {
				errorMsg = "";
			}, 1500);
		} else {
			await supabase.from("channels").insert([
				{
					name: newChannel,
					access: userSess.email,
				},
			]);
		}
	}

	async function addPerson() {
		console.log(activeChannel);
		const res = await supabase
			.from("channels")
			.select("*")
			.eq("name", activeChannel);
		console.log(res.data);

		const newStr = res.data[0].access.concat(", ", newEmail);
		console.log(newStr);

		await supabase
			.from("channels")
			.update({
				access: newStr,
			})
			.eq("name", activeChannel);
	}

	async function removePerson() {
		console.log(activeChannel);
		const res = await supabase
			.from("channels")
			.select("*")
			.eq("name", activeChannel);
		console.log(res.data);

		const newStr = res.data[0].access.replace(newEmail, "");
		console.log(newStr);

		await supabase
			.from("channels")
			.update({
				access: newStr,
			})
			.eq("name", activeChannel);
	}

	async function deletePost(postI, postN, postD, postE, isFile, postFiles) {
		errorMsg = "";
		deleting = true;
		await supabase.from("posts").delete().match({
			//name: postN,
			//description: postD,
			id: postI,
		});
		if (isFile) {
			for (let i = 0; i < postFiles.length; i++) {
				const { data, error } = await supabase.storage
					.from("user-files")
					.remove([
						postFiles[i].replace(
							`https://tymaawbbrmoeljisdgry.supabase.co/storage/v1/object/public/user-files/`,
							""
						),
					]);
			}
		}
		//await getData();
		deleting = false;
	}

	async function deleteTodo(todoI, todoN) {
		errorMsg = "";
		deleting = true;
		await supabase.from("todos").delete().match({
			name: todoN,
			id: todoI,
		});
		await getData();
		deleting = false;
	}

	async function deleteChannel() {
		errorMsg = "";
		deleting = true;
		await supabase.from("channels").delete().match({
			name: activeChannel,
		});
		await supabase.from("posts").delete().match({ channel: activeChannel });
		location.reload();
		deleting = false;
	}

	async function signUp(email, password, isAdmin) {
		const { user, session, error } = await supabase.auth.signUp({
			email: email,
			password: password,
		});
		if (error !== null) {
			errorMsg = error.message;
		} else {
			errorMsg = "";
			if (!isAdmin) {
				userSess = user;
			} else {
				adminEmail = "";
			}
			signedIn = true;
			//localStorage.signedIn = true
		}
	}

	async function signIn(email, password) {
		const { user, session, error } = await supabase.auth.signIn({
			email: email,
			password: password,
		});
		if (error !== null) {
			errorMsg = error.message;
		} else {
			errorMsg = "";
			//user = user;
			userSess = user;
			signedIn = true;
			//localStorage.signedIn = true
		}
	}

	async function signOut() {
		const { error } = await supabase.auth.signOut();

		if (error !== null) {
			errorMsg = error.message;
			setTimeout(() => {
				errorMsg = "";
			}, 1500);
		} else {
			signedIn = false;
			location.reload();
			//localStorage.signedIn = false
		}
	}

	supabase
		.from("posts")
		.on("*", (res) => {
			//console.log(res);

			getData();
			//console.log(posts);
		})
		.subscribe();

	supabase
		.from("todos")
		.on("*", (res) => {
			//console.log(res);

			getData();
			//location.reload();
			//console.log(todos);
		})
		.subscribe();

	function openSidebar() {
		if (!opened && !otherOpened) {
			document.getElementById("switchButton").style.visibility = "hidden";
			document.getElementById("infoButton").style.visibility = "hidden";
			document.getElementById("sidebar").style.width = "80%";
			opened = true;
		} else {
			document.getElementById("sidebar").style.width = "0%";
			document.getElementById("switchButton").style.visibility = "visible";
			document.getElementById("infoButton").style.visibility = "visible";
			opened = false;
		}
	}

	let otherOpened = false;

	function openOtherSidebar() {
		if (!otherOpened && !opened) {
			document.getElementById("othersidebar").style.width = "80%";
			otherOpened = true;
		} else {
			document.getElementById("othersidebar").style.width = "0%";
			otherOpened = false;
		}
	}

	let activeMentionPeople;
	let activeMentionPerson = availableMentions.length;

	function handleKeydown(event) {
		//console.log(activeMentionPeople)
		activeMentionPerson = availableMentions.length;
		if (event.key == "Enter") {
			addPost(activeChannel);
		}

		if (event.keyCode == 38) {
			event.preventDefault();
			activeMentionPerson =
				activeMentionPerson > 0 ? activeMentionPerson - 1 : 0;
			activeMentionPeople[activeMentionPerson].focus();
		}
	}

	function handleKeydownMentions(event) {
		if (event.keyCode == 38) {
			event.preventDefault();
			activeMentionPerson =
				activeMentionPerson > 0 ? activeMentionPerson - 1 : 0;
			activeMentionPeople[activeMentionPerson].focus();
		} else if (event.keyCode == 40) {
			event.preventDefault();
			activeMentionPerson =
				activeMentionPerson < activeMentionPeople.length - 1
					? activeMentionPerson + 1
					: activeMentionPeople.length - 1;
			activeMentionPeople[activeMentionPerson].focus();
		} else if (event.keyCode == 27) {
			document.getElementById("chatInput").focus();
		}
	}

	function handleKeydownTodo(event) {
		if (event.key == "Enter") {
			addTodo(activeChannel);
		}
	}

	async function uploadProfilePic(e) {
		console.log(e.target.files[0]);
		var file = e.target.files[0];
		if (e.target.files || e.target.files.length != 0) {
			console.log(file);
			console.log(file.name.split(".").pop());
			const fileExt = "png"; //file.name.split(".").pop();
			const fileName = `${userSess.id}/profile-picture.png`;
			/*const { data1, error1 } = await supabase.storage
				.from("profile-pics")
				.remove([fileName]);*/
			const { data, error } = await supabase.storage
				.from("profile-pics")
				.upload(fileName, file, {
					cacheControl: "0",
					upsert: true,
				});
			location.reload();
			console.log(data);
		}
	}

	async function removeProfilePic() {
		const fileName = `${userSess.id}/profile-picture.png`;

		const response = await fetch(
			"https://upload.wikimedia.org/wikipedia/commons/8/89/Portrait_Placeholder.png"
		);
		// here image is url/location of image
		const blob = await response.blob();
		const file = new File([blob], "image.jpg", { type: blob.type });

		const { data, error } = await supabase.storage
			.from("profile-pics")
			.upload(fileName, file, {
				cacheControl: "0",
				upsert: true,
			});
		location.reload();
	}

	async function downloadProfilePic() {
		try {
			const res = await fetch(
				`https://tymaawbbrmoeljisdgry.supabase.co/storage/v1/object/public/profile-pics/${userSess.id}/profile-picture.png`
			);
			if (res.status != 400) {
				profilePic = `https://tymaawbbrmoeljisdgry.supabase.co/storage/v1/object/public/profile-pics/${userSess.id}/profile-picture.png`;
			}
		} catch {}
	}

	async function uploadFiles(e) {
		let filesArr = [];
		let filePaths = [];
		console.log(e.target.files[0]);

		if (e.target.files || e.target.files.length != 0) {
			const { data, error } = await supabase.storage
				.from("user-files")
				.list(activeChannel);
			//console.log(data);
			errorMsg = "Uploading Files...";
			for (let i = 0; i < e.target.files.length; i++) {
				let fileName = e.target.files[i].name;
				let addOn = 0;
				for (let j = 0; j < data.length; j++) {
					if (fileName == data[j].name) {
						fileName =
							fileName.substring(0, fileName.lastIndexOf(".")) +
							`-${addOn}` +
							fileName.substring(fileName.lastIndexOf("."));
						j = -1;
						addOn++;
						continue;
					}
				}
				filesArr.push(fileName);
				filePaths.push(
					`https://tymaawbbrmoeljisdgry.supabase.co/storage/v1/object/public/user-files/${activeChannel}/${fileName}`
				);
			}
			for (let i = 0; i < e.target.files.length; i++) {
				const { data, error } = await supabase.storage
					.from("user-files")
					.upload(
						`${activeChannel}/${filesArr[i]}`,
						e.target.files[i],
						{
							cacheControl: "0",
							upsert: false,
						}
					);
			}

			let postDate = new Date();
			let postMinutes = postDate.getMinutes();
			let postHours = postDate.getHours();
			let amPm = " AM";
			let addOn = "";
			if (postMinutes < 10) {
				addOn = "0";
			}
			if (postHours > 12) {
				postHours -= 12;
				amPm = " PM";
			} else if (postHours == 12) {
				amPm = " PM";
			} else if (postHours == 0) {
				postHours += 12;
			}

			let valueForName = null;

			const newRes = await supabase
				.from("users")
				.select()
				.eq("email", userSess.email);

			if (newRes.data.length != 0) {
				if (newRes.data[0].name != null) {
					valueForName = newRes.data[0].name;
				}
			}

			await supabase.from("posts").insert([
				{
					email: userSess.email,
					channel: activeChannel,
					profilePicture: profilePic,
					createdAt:
						postDate.getMonth() +
						1 +
						"/" +
						postDate.getDate() +
						" " +
						postHours +
						":" +
						addOn +
						postMinutes +
						amPm,
					files: filePaths,
					personName: valueForName,
				},
			]);

			errorMsg = "";
		}
	}

	let timeout;

	let mouseMoving = false;
	let mouseMoved = false;

	import * as ifvisible from "ifvisible.js";

	ifvisible.setIdleDuration(120);

	window.addEventListener("DOMContentLoaded", async function () {
		const data2nd = await supabase
			.from("users")
			.select()
			.eq("email", userSess.email);
		//console.log(data);
		if (data2nd.data[0].status != "online") {
			console.log(data2nd.data[0].status);
			const { data1, error1 } = await supabase.from("users").upsert({
				id: data2nd.data[0].id,
				email: userSess.email,
				status: "online",
			});
		}
	});

	window.onbeforeunload = async function () {
		const data2nd = await supabase
			.from("users")
			.select()
			.eq("email", userSess.email);
		//console.log(data);
		if (data2nd.data[0].status != "offline") {
			console.log(data2nd.data[0].status);
			const { data1, error1 } = await supabase.from("users").upsert({
				id: data2nd.data[0].id,
				email: userSess.email,
				status: "offline",
			});
		}
		console.log("went here!");
		return null;
	};

	ifvisible.on("idle", async function () {
		const data2nd = await supabase
			.from("users")
			.select()
			.eq("email", userSess.email);
		//console.log(data);
		if (data2nd.data[0].status != "away") {
			console.log(data2nd.data[0].status);
			const { data1, error1 } = await supabase.from("users").upsert({
				id: data2nd.data[0].id,
				email: userSess.email,
				status: "away",
			});
		}
	});

	ifvisible.on("wakeup", async function () {
		const data2nd = await supabase
			.from("users")
			.select()
			.eq("email", userSess.email);
		//console.log(data);
		if (data2nd.data[0].status != "online") {
			console.log(data2nd.data[0].status);
			const { data1, error1 } = await supabase.from("users").upsert({
				id: data2nd.data[0].id,
				email: userSess.email,
				status: "online",
			});
		}
	});

	/*setInterval(async () => {
		if (!mouseMoved && mouseMoving) {
			const data2nd = await supabase
				.from("users")
				.select()
				.eq("email", userSess.email);
			//console.log(data);
			if (data2nd.data[0].status != "away") {
				console.log(data2nd.data[0].status);
				const { data1, error1 } = await supabase.from("users").upsert({
					id: data2nd.data[0].id,
					email: userSess.email,
					status: "away",
				});
			}
			mouseMoving = false;
		}
		mouseMoved = false;
	}, 5000);*/
	/*document.onmousemove = async function () {
		//clearTimeout(timeout);
		mouseMoving = true;
		mouseMoved = true;
		const { data, error } = await supabase
			.from("users")
			.select()
			.eq("email", userSess.email);

		//console.log(data);
		if (data[0].status != "online") {
			console.log(data[0].status)
			const { data2, error2 } = await supabase.from("users").upsert({
				id: data[0].id,
				email: userSess.email,
				status: "online",
			});
		}
		timeout = setTimeout(async function () {
			
		}, 5000);
	};*/

	supabase
		.from("users")
		.on("*", (res) => {
			//console.log(res);

			channelData.split(",").forEach((element, i) => {
				if (element == res.new.email) {
					peopleStatusChannel[i] = res.new.status;
					allChannelData.forEach((val, i) => {
						//console.log(res.new.name)
						if (val.name == res.new.name) {
							allChannelData[i].status = res.new.status;
						}
					});
				}
			});
			//location.reload();
			//console.log(todos);
		})
		.subscribe();

	/*document.addEventListener("paste", async (e) => {
		console.log(typeof e.clipboardData.files[0]);
		if (e.clipboardData.files.length) {
			let filePaths = [];

			let fileName = e.clipboardData.files[0].name;
			let addOn = 0;
			const { data, error } = await supabase.storage
				.from("user-files")
				.list(activeChannel);
			errorMsg = "Uploading Files...";
			for (let j = 0; j < data.length; j++) {
				if (fileName == data[j].name) {
					fileName =
						fileName.substring(0, fileName.lastIndexOf(".")) +
						`-${addOn}` +
						fileName.substring(fileName.lastIndexOf("."));
					j = -1;
					addOn++;
					continue;
				}
			}
			filePaths.push(
				`https://tymaawbbrmoeljisdgry.supabase.co/storage/v1/object/public/user-files/${activeChannel}/${fileName}`
			);

			const { data1, error1 } = await supabase.storage
				.from("user-files")
				.upload(
					`${activeChannel}/${fileName}`,
					e.clipboardData.files[0],
					{
						cacheControl: "0",
						contentType: "image/png",
						upsert: false,
					}
				);

			let postDate = new Date();
			let postMinutes = postDate.getMinutes();
			let postHours = postDate.getHours();
			let amPm = " AM";
			let addOn2 = "";
			if (postMinutes < 10) {
				addOn = "0";
			}
			if (postHours > 12) {
				postHours -= 12;
				amPm = " PM";
			} else if (postHours == 12) {
				amPm = " PM";
			} else if (postHours == 0) {
				postHours += 12;
			}

			const { data2, error2 } = await supabase.from("posts").insert([
				{
					email: userSess.email,
					channel: activeChannel,
					profilePicture: profilePic,
					isFile: true,
					createdAt:
						postDate.getMonth() +
						1 +
						"/" +
						postDate.getDate() +
						" " +
						postHours +
						":" +
						addOn2 +
						postMinutes +
						amPm,
					files: filePaths,
				},
			]);

			errorMsg = "";
		}
	});*/
</script>

<div class="flex overflow-auto overflow-x-auto flex-col-reverse h-screen">
	{#if userSess !== null}
		{#await getData()}
			<div class="flex justify-center items-center h-screen">
				<p class="text-5xl text-emerald-500">Grabbing data...</p>
			</div>
		{:then}
			{#if !deleting}
				<div class="flex flex-row ">
					<div
						class="w-2/12 fixed left-0 top-0 h-screen text-white overflow-y-auto flex flex-col pt-12 pb-16"
						id="othersidebar"
						style="background-color: #39133D; width: 0%; transition: 0.5s;"
					>
						<p class="m-2 text-lg">
							The Tesla Stem Productivity App
						</p>
						<hr />
						{#each channels as channel}
							{#if activeChannel == channel}
								<button
									class="w-full text-left pl-1 py-1"
									style="background-color: #2F629E;"
									on:click={() => {
										activeChannel = channel;
										openOtherSidebar();
										getData();
									}}># {channel}</button
								>
							{:else}
								<button
									class="border-emerald-400 w-full text-left pl-1 py-1"
									on:click={() => {
										activeChannel = channel;
										openOtherSidebar();
										getData();
									}}># {channel}</button
								>
							{/if}
						{/each}
						{#if activeChannel == "null"}
							<button
								class="w-full text-left pl-1 py-1"
								style="background-color: #2F629E;"
								on:click={() => {
									activeChannel = "null";
									openOtherSidebar();
									getData();
								}}># Public Chat</button
							>
						{:else}
							<button
								class="w-full text-left pl-1 py-1"
								on:click={() => {
									activeChannel = "null";
									openOtherSidebar();
									getData();
								}}># Public Chat</button
							>
						{/if}
						<button
							class="bg-red-500 text-white p-2 m-1 rounded-md mt-3"
							on:click={async () => {
								await signOut();
							}}>Sign Out</button
						>
						<button
							class="bg-emerald-500 text-white p-2 m-1 rounded-md"
							on:click={() => {
								chatOrTodo = "profile";
								openOtherSidebar();
							}}>Profile</button
						>
					</div>
					{#if chatOrTodo == "chat"}
						<div class="ml-0 w-screen" id="mainContent">
							<div class="fixed top-0">
								<div class="bg-white w-screen p-2">
									<button
										class="rounded-md fixed top-1 left-1 text-xl"
										style="right: 0.25rem; transition: 0.5s;"
										on:click={openOtherSidebar}>☰</button
									>
									<p class="pl-5">
										# {activeChannel == "null"
											? "Public Chat"
											: activeChannel}
									</p>
									<button
										id="switchButton"
										class="border-2 border-black p-1 rounded-md fixed top-1 right-1"
										style="right: 3rem; transition: 0.5s;"
										on:click={() => {
											chatOrTodo = "todos";
										}}>Todos</button
									>
									<button
										id="infoButton"
										class="border-2 border-black p-1 rounded-md fixed top-1 right-1"
										style="right: 0.25rem; transition: 0.5s;"
										on:click={openSidebar}>Info</button
									>
								</div>
							</div>
							<div
								class="pt-10 flex"
								style="padding-bottom: 3.2rem;"
							>
								<div
									class="flex flex-col"
									on:click={() => {
										if (otherOpened) {
											openOtherSidebar();
										}
										if (opened) {
											openSidebar();
										}
									}}
								>
									{#each posts as post}
										<div class="flex flex-row pl-1">
											{#if !post.profilePicture}
												<img
													src="https://upload.wikimedia.org/wikipedia/commons/8/89/Portrait_Placeholder.png"
													alt="Default Profile Pic"
													class="w-8 h-8 rounded-sm self-center"
												/>
											{:else}
												<img
													src={post.profilePicture}
													alt="Default Profile Pic"
													class="w-8 h-8 rounded-sm self-center"
												/>
											{/if}
											<div class="pl-3 w-fit">
												<div class="flex">
													<p class="font-bold">
														{post.personName != null
															? post.personName
															: post.email}
													</p>
													<p
														class="mx-2 text-gray-500"
													>
														{#if post.createdAt != null}
															{post.createdAt}
														{/if}
													</p>
												</div>
												{#if post.description != null}
													<p>{post.description}</p>
												{/if}
												<div class="flex">
													{#if post.description != null}
														<p>
															{post.name}
														</p>
													{:else if post.files != null}
														{#each post.files as file}
															{#if file.endsWith(".png") || file.endsWith(".jpg") || file.endsWith(".jpeg")}
																<img
																	class="max-w-[90%] max-h-[90%]"
																	src={file}
																	alt="File"
																/>
															{:else}
																<div
																	class="rounded-md border-2 p-1 m-1 flex border-black max-h-16"
																>
																	<svg
																		xmlns="http://www.w3.org/2000/svg"
																		class="h-6 w-6"
																		fill="none"
																		viewBox="0 0 24 24"
																		stroke="currentColor"
																	>
																		<path
																			stroke-linecap="round"
																			stroke-linejoin="round"
																			stroke-width="2"
																			d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
																		/>
																	</svg>
																	<a
																		href={file}
																		download
																		>{file.replace(
																			`https://tymaawbbrmoeljisdgry.supabase.co/storage/v1/object/public/user-files/${activeChannel}/`,
																			""
																		)}</a
																	>
																</div>
															{/if}
														{/each}
													{/if}
													{#if userSess.email.toLowerCase() == post.email}
														<button
															class="ml-3 text-red-500"
															on:click={() => {
																deletePost(
																	post.id,
																	post.name,
																	post.description,
																	post.email,
																	post.isFile,
																	post.files
																);
															}}>Delete</button
														>
													{/if}
												</div>
											</div>
										</div>
									{/each}
								</div>
							</div>
							<div class="fixed bottom-0">
								{#if showMentionPanel}
									<div
										class="bg-white w-80 flex flex-col bottom-16 overflow-y-scroll"
									>
										{#each availableMentions as mentionPerson}
											<button
												id="eachPerson"
												class="hover:bg-gray-200 focus:bg-blue-600 focus:text-white focus:outline-none flex p-1"
												on:keydown={handleKeydownMentions}
												on:click={() => {
													let newText =
														name.substring(
															0,
															name.lastIndexOf(
																"@"
															)
														) +
														"@" +
														mentionPerson +
														" ";
													name = newText;
													showMentionPanel = false;
													nameInput.focus();
												}}>{mentionPerson}</button
											>
										{/each}
									</div>
								{/if}
								<div class="bg-white w-screen flex bottom-12">
									<p style="color: red;">{errorMsg}</p>
								</div>
								<div class="bg-white w-screen flex">
									<label
										class="bg-gray-100 h-11 w-11 p-0 self-center rounded-md"
									>
										<input
											type="file"
											hidden
											multiple
											on:change={uploadFiles}
										/>
										<svg
											xmlns="http://www.w3.org/2000/svg"
											class="h-11 w-11"
											fill="none"
											viewBox="0 0 24 24"
											stroke="currentColor"
										>
											<path
												strokeLinecap="round"
												strokeLinejoin="round"
												strokeWidth={2}
												d="M12 9v3m0 0v3m0-3h3m-3 0H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z"
											/>
										</svg>
									</label>
									<input
										id="chatInput"
										placeholder="Text (required): "
										bind:value={name}
										bind:this={nameInput}
										on:keydown={handleKeydown}
										on:keyup={() => {
											activeMentionPeople =
												document.querySelectorAll(
													"[id=eachPerson]"
												);
										}}
										class="border-2 p-2 m-1 rounded-md w-5/12 resize-none h-11"
										on:input={() => {
											let subStr = name.substring(
												name.lastIndexOf("@") + 1
											);
											let myVar = false;
											availableMentions = [];
											if (name.lastIndexOf("@") != -1) {
												for (let i in channelPeople) {
													if (
														channelPeople[
															i
														].includes(subStr)
													) {
														myVar = true;
														showMentionPanel = true;
														availableMentions = [
															...availableMentions,
															channelPeople[i],
														];
													}
												}
											}
											if (!myVar) {
												availableMentions = [];
												showMentionPanel = false;
											}
										}}
									/>
									<button
										on:click={() => {
											addPost(activeChannel);
										}}
										class="bg-emerald-400 p-2 m-1 shadow-xl rounded-md h-11"
										>Send</button
									>
								</div>
							</div>
						</div>
					{:else if chatOrTodo == "todos"}
						<div id="mainContent" style="width: 100%">
							<div class="fixed top-0">
								<div class="bg-white w-screen p-2">
									<button
										class="rounded-md fixed top-1 left-1 text-xl"
										style="right: 0.25rem; transition: 0.5s;"
										on:click={openOtherSidebar}>☰</button
									>
									<p class="pl-5">
										# {activeChannel == "null"
											? "Public Chat"
											: activeChannel}
									</p>
									<button
										id="switchButton"
										class="border-2 border-black p-1 rounded-md fixed top-1 right-1"
										style="right: 3rem; transition: 0.5s;"
										on:click={() => {
											chatOrTodo = "chat";
										}}>Chat</button
									>
									<button
										id="infoButton"
										class="border-2 border-black p-1 rounded-md fixed top-1 right-1"
										style="right: 0.25rem; transition: 0.5s;"
										on:click={openSidebar}>Info</button
									>
								</div>
							</div>
							<div class="pt-8 pb-16 ml-2">
								<p class="text-3xl pb-1">In Progress</p>
								{#each todos as todo}
									<label>
										<input
											type="checkbox"
											on:click={() => {
												updateTodo(true, todo.name);
											}}
										/>
										{todo.name}
										{#if userSess.email.toLowerCase() == todo.email}
											<button
												class="ml-3 text-red-500"
												on:click={() => {
													deleteTodo(
														todo.id,
														todo.name
													);
												}}>Delete this todo</button
											>
										{/if}
										<br />
									</label>
								{/each}
								<p class="text-3xl pb-1">Completed</p>
								{#each completedTodos as todo}
									<label>
										<input
											type="checkbox"
											disabled
											checked
											on:click={() => {
												updateTodo(false, todo.name);
											}}
										/>
										{todo.name}
										<button
											class="ml-3 text-emerald-500"
											on:click={() => {
												updateTodo(false, todo.name);
											}}>Make unchecked</button
										>
										{#if userSess.email.toLowerCase() == todo.email}
											<button
												class="ml-3 text-red-500"
												on:click={() => {
													deleteTodo(
														todo.id,
														todo.name
													);
												}}>Delete this todo</button
											>
										{/if}
										<br />
									</label>
								{/each}
							</div>
							<div class="fixed bottom-0">
								<div class="bg-white w-screen">
									<p style="color: red;">{errorMsg}</p>
									<input
										on:keydown={handleKeydownTodo}
										placeholder="Name of Todo (required): "
										bind:value={name}
										class="border-2 p-2 m-1 rounded-md w-64"
									/>
									<button
										on:click={() => {
											addTodo(activeChannel);
										}}
										class="bg-emerald-400 p-2 m-1 shadow-xl rounded-md"
										>Create</button
									>
								</div>
							</div>
						</div>
					{:else}
						<div class="flex flex-col justify-center items-center">
							<button
								class="p-5"
								on:click={() => {
									chatOrTodo = "chat";
								}}>{"<"} Go Back</button
							>
							<p class="text-2xl font-bold p-2">
								{userSess.email}
							</p>
							<p>Current Profile Picture:</p>
							{#await downloadProfilePic()}
								<p>Getting photo...</p>
							{:then}
								<img
									src={profilePic}
									alt="Default Profile Pic"
									class="w-48 h-48 p-2 rounded-3xl hover:opacity-50"
								/>
							{/await}
							<input
								type="file"
								id="newPic"
								class="pl-28 pt-2 text-emerald-500"
								accept="image/*"
								on:change={uploadProfilePic}
							/>
							<button
								class="p-2 m-1 mt-3 rounded-md bg-red-500 text-white"
								on:click={removeProfilePic}
								>Delete Profile Pic</button
							>
							<p class="pt-5 text-xl">Update your password:</p>
							<input
								placeholder="New Password: "
								type="password"
								bind:value={newPassword}
								class="border-2 p-2 m-1 rounded-md"
							/>
							<button
								class="p-2 m-1 rounded-md bg-red-500 text-white"
								on:click={async () => {
									const { user, error } =
										await supabase.auth.update({
											password: newPassword,
										});
									location.reload();
								}}>Update</button
							>
							<p class="pt-5 text-xl">Set your Display Name:</p>
							<input
								placeholder="New Name: "
								bind:value={newName}
								class="border-2 p-2 m-1 rounded-md"
							/>
							<button
								class="p-2 m-1 rounded-md bg-emerald-500"
								on:click={async () => {
									const { data, error } = await supabase
										.from("users")
										.select()
										.eq("email", userSess.email);
									console.log(data);
									if (data.length != 0) {
										console.log("here");
										const { data1, error1 } = await supabase
											.from("users")
											.upsert({
												id: data[0].id,
												email: userSess.email,
												status: "online",
												name: newName,
											});
									} else {
										const { data1, error1 } = await supabase
											.from("users")
											.insert({
												email: userSess.email,
												status: "online",
												name: newName,
											});
									}
									location.reload();
								}}>Update</button
							>
							{#if userSess.email == "rohit.karthik@outlook.com" || userSess.email == "s-rkarthik@lwsd.org"}
								<input
									type="email"
									placeholder="New User Email: "
									bind:value={adminEmail}
									class="border-2 p-2 m-1 rounded-md"
								/>
								<button
									class="bg-emerald-400 shadow-sm shadow-emerald-400 p-2 m-1 rounded-md"
									on:click={() => {
										signUp(adminEmail, "password", true);
									}}>Add user</button
								>
							{/if}
						</div>
					{/if}
					<div
						class="fixed right-0 top-0 flex flex-col h-screen bg-white pt-1"
						style="width: 0%; transition: 0.5s;"
						id="sidebar"
					>
						<button
							id="infoButton"
							class="border-2 border-black p-1 rounded-md"
							style="right: 0.25rem; transition: 0.5s;"
							on:click={openSidebar}>Close Panel</button
						>
						{#if activeChannel != "null"}
							<p class="font-bold text-xl m-1">Members:</p>
							{#each allChannelData as person}
								<div class="flex items-center">
									<img
										src={person.status == "online"
											? "https://bit.ly/3rTxbrW"
											: person.status == "away"
											? "https://bit.ly/3AvrIvk"
											: "https://png.pngitem.com/pimgs/s/204-2040894_grey-circle-icon-transparent-png-download-small-black.png"}
										alt="Status"
										class="w-3 h-3"
									/>
									<p class="m-1">
										{person.name}
									</p>
								</div>
							{/each}
							<div class="flex">
								<button
									class="p-2 m-1 rounded-md bg-emerald-400 shadow-lg"
									on:click={async () => {
										await addPerson();
										newEmail = "";
										await getData();
									}}>+ Add Person</button
								>
								<button
									class="p-2 m-1 rounded-md bg-red-500 shadow-lg"
									on:click={async () => {
										await removePerson();
										newEmail = "";
										await getData();
									}}>+ Remove Person</button
								>
							</div>
							<input
								placeholder="Email of Person: "
								bind:value={newEmail}
								class="border-2 p-2 m-1 rounded-md"
							/>
						{/if}
						<button
							class="p-2 m-1 rounded-md bg-emerald-400 shadow-lg"
							on:click={async () => {
								await addChannel();
								newChannel = "";
								await getData();
							}}>+ Create a new Channel</button
						>
						<input
							placeholder="Name of Channel: "
							bind:value={newChannel}
							class="border-2 p-2 m-1 rounded-md"
						/>
						{#if activeChannel != "null"}
							<button
								class="p-2 m-1 rounded-md bg-red-500 shadow-lg"
								on:click={() => {
									deleteChannel();
								}}>Delete this channel</button
							>
						{/if}
					</div>
				</div>
			{:else}
				<div class="flex justify-center items-center h-screen">
					<p class="text-5xl text-red-500">Deleting item...</p>
				</div>
			{/if}
		{/await}
	{:else}
		<div class="flex flex-col items-center justify-center h-screen">
			<p class="text-5xl m-3">The Tesla Stem Productivity App</p>
			<input
				type="email"
				placeholder="Your Email: "
				bind:value={email}
				class="border-2 p-2 m-1 rounded-md"
			/>
			<input
				type="password"
				placeholder="Your Password:  "
				bind:value={pass}
				class="border-2 p-2 m-1 rounded-md"
			/>
			<button
				class="bg-emerald-400 shadow-sm shadow-emerald-400 p-2 m-1 rounded-md"
				on:click={() => {
					window.open(
						`mailto:s-rkarthik@lwsd.org?subject=I'd like to sign up for the chat app!&body=I'd like to sign up for the chat app! Here's the email I would like to use: ${email}.`
					);
				}}>Verify for Sign Up</button
			>
			<button
				class="border-2 border-emerald-400 p-2 m-1 rounded-md"
				on:click={() => {
					signIn(email, pass);
				}}>Sign In</button
			>
			<p style="color: red;">{errorMsg}</p>
		</div>
	{/if}
</div>
