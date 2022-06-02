# Oxigen router

`Oxigen router` helps you to change the state of the application moving from one state to another while maintaining application persistence.

# Usage

    import Component, { sass, html } from "oxigen-core";
	import { Switch, Scope, Route, View } from "oxigen-router";
    
	const App = Component({
		taged: "oxi-app",
		define: [Switch, Scope, Route, View],
		styles() {
			return sass\`
				*, :host {
					box-sizing: border-box;
				}
				:host {
					display: block;
					width: 100%;
					max-width: 1200px;
					padding: 1rem;
					margin: auto;
				}
			\`;
		},
		render() {
			return html\`
				<oxi-view>
					<oxi-switch>
						<oxi-route path="/" name="home">
							<h1>Home</h1>
						</oxi-route>
						<oxi-scope path="/view">
							<oxi-route path="/1" name="view-1">
								<h1>View 1</h1>
							</oxi-route>
							<oxi-route path="/2" name="view-2">
								<h1>View 2</h1>
							</oxi-route>
							<oxi-route path="/3" name="view-3">
								<h1>View 3</h1>
							</oxi-route>
						</oxi-scope>
						<oxi-route path="/404" name="404">
							<h1>404</h1>
						</oxi-route>
					</oxi-switch>
				</oxi-view>
			\`;
		},
	});
	
	App.define();

