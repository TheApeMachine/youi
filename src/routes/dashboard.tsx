import Bars from "@/lib/ui/charts/Bars";
import Donut from "@/lib/ui/charts/Donut";
import { jsx } from "@/lib/template";
import Calendar from "@/lib/ui/calendar/Calendar";
import { stateManager } from "@/lib/state";
import gsap from "gsap";
import { Flip } from "gsap/Flip";
import { Row, Column } from "@/lib/ui/Flex";
import Actions from "./dashboard/Actions";
import Profile from "./dashboard/Profile";
import { from } from "@/lib/mongo/query";
import { Grid, GridItem } from "@/lib/ui/Grid";

gsap.registerPlugin(Flip);

export default async () => {
    const user = await stateManager.get("user");
    const dbUser = await from("User").where({ Auth0UserId: user?.sub }).exec();

    return (
        <Grid
            areas={["actions profile calendar", "metrics activity calendar"]}
            className="dashboard-grid"
        >
            <GridItem area="actions">
                <Actions />
            </GridItem>
            <GridItem area="profile">
                <Profile user={user} />
            </GridItem>
            <GridItem area="calendar">
                <Calendar />
            </GridItem>
            <GridItem area="metrics">
                <Donut />
            </GridItem>
            <GridItem area="activity">
                <Bars />
            </GridItem>
        </Grid>
    );
};
