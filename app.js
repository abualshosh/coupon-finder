/*
Chrome extension documentation
https://developer.chrome.com/extensions/runtime#method-sendMessage
*/

// Get current domain
let domain = window.location.hostname
domain = domain
	.replace('http://', '')
	.replace('https://', '')
	.replace('www.', '')
	.split(/[/?#]/)[0]

// Send domain message
chrome.runtime.sendMessage(
	{ command: 'fetch', data: { domain: domain } },
	(response) => {
		// Response from the database to background.html
		console.log('Response from firebase', response)
		parseCoupons(response.data, domain)
	}
)

// Send submit coupon
const submitCoupon = (code, desc, domain) => {
	chrome.runtime.sendMessage(
		{ command: 'post', data: { code: code, desc: desc, domain: domain } },
		(response) => {
			// check input is valid
			if (document.querySelector('._submit__overlay input').value == '') {
				alert('Please enter a valid input!')
			} else {
				document.querySelector('._submit__overlay').style.display = 'none'
				console.log(response)
				alert('Coupon Submitted!')
			}
		}
	)
}

const parseCoupons = (coupons, domain) => {
	try {
		let couponHTML = ''
		// loop over coupons in coupon's list
		for (let key in coupons) {
			let coupon = coupons[key]
			couponHTML +=
				'<li><span class="code">' +
				coupon.code +
				'</span>' +
				'<p> &rarr; ' +
				coupon.desc +
				'</p></li>'
		}
		// Display message if there is no coupon
		if (couponHTML === '') {
			couponHTML = '<p>Be the first to submit a coupon for this site!</p>'
		}

		// display coupon list
		const couponDisplay = document.createElement('div')
		couponDisplay.className = '_coupon__list'
		couponDisplay.innerHTML =
			'<div class="submit-button">Submit A Coupon</div>' +
			'<p>Browse coupons below that have been used for <strong>' +
			domain +
			'</strong></p>' +
			'<p style="font-style: italic; padding: 5px;">Click any coupon to copy &amp; use</p>' +
			'<ul>' +
			couponHTML +
			'</ul>'
		document.body.appendChild(couponDisplay)

		// button to show list of coupons
		const couponButton = document.createElement('div')
		couponButton.className = '_coupon__button'
		couponButton.innerHTML = '💰'
		document.body.appendChild(couponButton)

		// Submit coupon button
		const couponSubmitOverlay = document.createElement('div')
		couponSubmitOverlay.className = '_submit__overlay'
		couponSubmitOverlay.innerHTML =
			'<span class="close-button">x</span>' +
			'<h3>Do you have a coupon for this site?</h3>' +
			'<div><label>Code:</label><input type="text" class="code"/></div>' +
			'<div><label>Description:</label><input type="text" class="desc"/></div>' +
			'<div><button class="submit-button">Submit</button></div>'
		couponSubmitOverlay.style.display = 'none'
		document.body.appendChild(couponSubmitOverlay)

		displayCouponList()
	} catch (e) {
		console.log('No coupon found for this domain', e)
	}
}

const displayCouponList = () => {
	// Show submit overlay
	document
		.querySelector('._coupon__list .submit-button')
		.addEventListener('click', () => {
			document.querySelector('._submit__overlay').style.display = 'block'
		})
	// Close submit overlay
	document
		.querySelector('._submit__overlay .close-button')
		.addEventListener('click', () => {
			console.log('close overlay')
			document.querySelector('._submit__overlay').style.display = 'none'
		})

	// Show/hide list of coupons
	document.querySelector('._coupon__button').addEventListener('click', () => {
		if (document.querySelector('._coupon__list').style.display === 'block') {
			document.querySelector('._coupon__list').style.display = 'none'
			document.querySelector('._coupon__button').innerHTML = '💰'
		} else {
			document.querySelector('._coupon__list').style.display = 'block'
			document.querySelector('._coupon__button').innerHTML = 'X'
		}
	})

	// Submit coupon to db
	document
		.querySelector('._submit__overlay .submit-button')
		.addEventListener('click', () => {
			const code = document.querySelector('._submit__overlay .code').value
			const desc = document.querySelector('._submit__overlay .desc').value
			submitCoupon(code, desc, domain)
		})

	// Copy coupon on click
	document.querySelectorAll('._coupon__list .code').forEach((codeItem) => {
		codeItem.addEventListener('click', () => {
			const codeStr = codeItem.innerHTML
			copyToClipboard(codeStr)
		})
	})
}

// Copy to clipboard
const copyToClipboard = (str) => {
	const input = document.createElement('textarea')
	input.innerHTML = str
	document.body.appendChild(input)
	input.select()
	const result = document.execCommand('copy')
	document.body.removeChild(input)
	return result
}
