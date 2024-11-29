import { Bars } from "@/lib/charts/Bars"
import { Donut } from "@/lib/charts/Donut"
import { jsx } from "@/lib/template"
import { Component } from "@/lib/ui/Component"
import { faker } from "@faker-js/faker"
import { Calendar } from "@/lib/ui/calendar/Calendar"

export const render = Component({
    render: () => (
        <div class="column width height gap pad">
            <header class="row center pad bg-dark">
                <h1>Dashboard</h1>
            </header>
            <div class="row gap-xl">
                <aside class="column gap grow">
                    <div class="column grow width bg-dark">
                        <nav class="column grow width">
                            <a href="/dashboard/settings" class="badge-button">
                                <span class="material-symbols-rounded">mail</span>
                                Messages
                                <span class="badge">3</span>
                            </a>
                            <a href="/dashboard/profile" class="badge-button">
                                <span class="material-symbols-rounded">send</span>
                                Invitations
                                <span class="badge">3</span>
                            </a>
                            <a href="/dashboard/logout" class="badge-button">
                                <span class="material-symbols-rounded">calendar_month</span>
                                Events
                                <span class="badge">3</span>
                            </a>
                            <a href="/dashboard/logout" class="badge-button">
                                <span class="material-symbols-rounded">settings</span>
                                Account Settings
                            </a>
                            <a href="/dashboard/logout" class="badge-button">
                                <span class="material-symbols-rounded">monitoring</span>
                                Statistics
                            </a>
                        </nav>
                    </div>
                    <div class="column grow bg-dark">
                        <Donut />
                    </div>
                </aside>
                <div class="column gap grow">
                    <div class="column center grow bg-dark">
                        <img class="avatar xl" src={faker.image.avatar()} alt="avatar" />
                        <h3 class="lighter">{faker.person.fullName()}</h3>
                        <footer class="row">
                            <a href="/dashboard/profile" class="accent-button yellow">
                                <span class="material-icons">forum</span> 6
                            </a>
                            <a href="/dashboard/profile" class="accent-button green">
                                <span class="material-icons">visibility</span> 14
                            </a>
                            <a href="/dashboard/profile" class="accent-button red">
                                <span class="material-icons">favorite</span> 22
                            </a>
                        </footer>
                    </div>
                    <div class="column grow bg-dark">
                        <Bars />
                    </div>
                </div>
                <Calendar />
            </div>
        </div>
    )
})