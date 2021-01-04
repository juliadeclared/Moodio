import React, { Component } from "react";

class Main extends Component {
	componentDidMount() {
		const classifier = knnClassifier.create();
		const webcamElement = document.getElementById("webcam");

		let net;

		async function app() {
			console.log("Loading mobilenet..");

			// Load the model.
			net = await mobilenet.load();
			console.log("Successfully loaded model");

			// Create an object from Tensorflow.js data API which could capture image
			// from the web camera as Tensor.
			const webcam = await tf.data.webcam(webcamElement);

			// Reads an image from the webcam and associates it with a specific class
			// index.
			const addExample = async (classId) => {
				// Capture an image from the web camera.
				const img = await webcam.capture();

				// Get the intermediate activation of MobileNet 'conv_preds' and pass that
				// to the KNN classifier.
				const activation = net.infer(img, true);

				// Pass the intermediate activation to the classifier.
				classifier.addExample(activation, classId);

				// Dispose the tensor to release the memory.
				img.dispose();
			};

			// When clicking a button, add an example for that class.
			document
				.getElementById("class-a")
				.addEventListener("click", () => addExample(0));
			document
				.getElementById("class-b")
				.addEventListener("click", () => addExample(1));
			document
				.getElementById("class-c")
				.addEventListener("click", () => addExample(2));

			while (true) {
				if (classifier.getNumClasses() > 0) {
					const img = await webcam.capture();

					// Get the activation from mobilenet from the webcam.
					const activation = net.infer(img, "conv_preds");
					// Get the most likely class and confidence from the classifier module.
					const result = await classifier.predictClass(activation);

					const classes = ["Neutral", "Happy", "Sad"];
					document.getElementById("console").innerText = `
        ${classes[result.label]}\n
        probability: ${result.confidences[result.label]}
      `;
					// Dispose the tensor to release the memory.
					img.dispose();
				}
				// Give some breathing room by waiting for the next animation frame to
				// fire.
				await tf.nextFrame();
			}
		}
		app();
	}

	render() {
		return (
			<div className="main">
				<div className="video-container">
					<video
						autoplay
						playsinline
						muted
						id="webcam"
						width="500"
						height="500"
					></video>
					<div id="console"></div>
				</div>
				<div className="button-contaier">
					<button id="class-a">neutral</button>
					<button id="class-b">happy</button>
					<button id="class-c">sad</button>
				</div>
			</div>
		);
	}
}

export default Main;