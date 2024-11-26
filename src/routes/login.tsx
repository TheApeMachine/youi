import { jsx } from "@/lib/template";
import { Component } from "@/lib/ui/Component";
import { AuthService } from "@/lib/auth";
import "@/assets/login.css";
import { eventBus } from "@/lib/event";

export const render = Component({
    effect: () => {
        const form = document.querySelector("form");
        const errorMessage = document.querySelector(".callout.error");
        const errorMessageText = document.querySelector(".message h6");
        const loadingSpinner = document.querySelector(".loading-spinner");

        // Handle form submission
        form?.addEventListener("submit", async (e: Event) => {
            e.preventDefault();

            const username = (document.querySelector("#username") as HTMLInputElement).value;
            const password = (document.querySelector("#password") as HTMLInputElement).value;

            if (!username || !password) {
                if (errorMessage instanceof HTMLElement) {
                    errorMessage.textContent = "Please fill in all fields";
                    errorMessage.style.opacity = "1";
                }
                return;
            }

            try {
                if (loadingSpinner instanceof HTMLElement) {
                    loadingSpinner.style.display = "block";
                }
                if (errorMessage instanceof HTMLElement) {
                    errorMessage.style.opacity = "0";
                }

                const token = await AuthService.login(username, password);
                const user = await AuthService.getUserInfo(token.accessToken);

                // Redirect to home page
                window.location.href = "/";
            } catch (error) {
                if (errorMessage instanceof HTMLElement && errorMessageText instanceof HTMLElement) {
                    errorMessageText.textContent = error instanceof Error ? error.message : "Login failed";
                    errorMessage.style.opacity = "1";
                }
            } finally {
                if (loadingSpinner instanceof HTMLElement) {
                    loadingSpinner.style.display = "none";
                }
            }
        });

        // Handle input focus effects
        document.querySelectorAll(".input-group input").forEach(input => {
            input.addEventListener("focus", () => {
                const group = input.closest(".input-group");
                if (group instanceof HTMLElement) {
                    group.classList.add("focused");
                }
            });

            input.addEventListener("blur", () => {
                const group = input.closest(".input-group");
                if (group instanceof HTMLElement && !(input as HTMLInputElement).value) {
                    group.classList.remove("focused");
                }
            });
        });
    },
    render: async () => (
        <div class="row grow">
            <div class="column pad center">
                <div class="column pad gap radius-xs login-card">
                    <div class="column gap brand">
                        <h1>Fan App</h1>
                        <p>Sign in to continue</p>
                    </div>

                    <form class="column gap">
                        <div class="row callout error">
                            <div class="column message">
                                <sub>ERROR</sub>
                                <h6></h6>
                            </div>
                        </div>

                        <div class="input-group">
                            <input type="text" id="username" required />
                            <label for="username">Username</label>
                            <span class="material-icons">person</span>
                        </div>

                        <div class="input-group">
                            <input type="password" id="password" required />
                            <label for="password">Password</label>
                            <span class="material-icons">lock</span>
                        </div>

                        <div class="row gap options">
                            <label class="remember-me">
                                <input type="checkbox" />
                                <span>Remember me</span>
                            </label>
                            <a href="/forgot-password" class="forgot-password">Forgot password?</a>
                        </div>

                        <button type="submit" class="row center shrink button">
                            <span>Sign In</span>
                            <div class="loading-spinner"></div>
                        </button>
                    </form>

                    <div class="social-login">
                        <p>Or sign in with</p>
                        <div class="social-buttons">
                            <button class="social-button google">
                                <span class="material-icons">google</span>
                            </button>
                            <button class="social-button github">
                                <span class="material-icons">code</span>
                            </button>
                            <button class="social-button twitter">
                                <span class="material-icons">flutter_dash</span>
                            </button>
                        </div>
                    </div>

                    <div class="signup-link">
                        <p>Don't have an account? <a href="/signup">Sign up</a></p>
                    </div>
                </div>
            </div>
            <div class="column center random-image">
                <img src="/public/logo.png" alt="logo" class="logo" />
            </div>
        </div>
    )
});
