const firebaseConfig = {
	apiKey: 'AIzaSyDV962kgMe89bOTdLk803coe3lirwduHEg',
	authDomain: 'coupons-finder-4c818.firebaseapp.com',
	databaseURL: 'https://coupons-finder-4c818-default-rtdb.firebaseio.com',
	projectId: 'coupons-finder-4c818',
	storageBucket: 'coupons-finder-4c818.appspot.com',
	messagingSenderId: '315420694517',
	appId: '1:315420694517:web:f9d044276419853599f2bc',
}
firebase.initializeApp(firebaseConfig)

// Get the message from browser
chrome.runtime.onMessage.addListener((msg, sender, response) => {
	// Fetch coupons from db
	if (msg.command == 'fetch') {
		const domain = msg.data.domain
		const encoded_domain = btoa(domain)
		firebase
			.database()
			.ref('/domain/' + encoded_domain)
			.once('value')
			.then((snapshot) => {
				response({
					type: 'result',
					status: 'success',
					data: snapshot.val(),
					request: msg,
				})
				console.log(response)
			})
	}
	// Post coupons to db
	if (msg.command == 'post') {
		const domain = msg.data.domain
		const encoded_domain = btoa(domain)
		const code = msg.data.code
		const desc = msg.data.desc
		try {
			const newPost = firebase
				.database()
				.ref('/domain/' + encoded_domain)
				.push()
				.set({ code, desc })
			const postId = newPost.key
			// send response to background.html
			response({
				type: 'result',
				status: 'success',
				data: postId,
				request: msg,
			})
		} catch (e) {
			response({
				type: 'result',
				status: 'fail',
				data: e,
				request: msg,
			})
		}
	}
	return true
})
