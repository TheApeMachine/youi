import { YouI } from "@/lib/youi"

export const render = YouI(
    <DynamicIsland
        load={[currentUser.include([Message, Feedback])]}
        Header={<Menu />}
        Aside={<Aside />}
        Main={<Main />}
        Article={<Article />}
        Footer={<Footer />}
    >
)