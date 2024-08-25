const { widget } = figma
const { AutoLayout, Text, usePropertyMenu, useSyncedState, Input } = widget

function Widget() {
    const settingsIcon = `<svg width='16' height='16' xmlns='http://www.w3.org/2000/svg'><path d='M9.817.639a7.572 7.572 0 013.649 2.109l-.668 1.849c.212.297.396.615.55.95l1.936.346c.193.669.296 1.376.296 2.107 0 .731-.103 1.438-.296 2.107l-1.936.346a5.876 5.876 0 01-.55.95l.668 1.85a7.572 7.572 0 01-3.65 2.108l-1.268-1.504a5.956 5.956 0 01-1.096 0l-1.268 1.504a7.572 7.572 0 01-3.65-2.109l.668-1.849a5.876 5.876 0 01-.55-.95l-1.936-.346A7.584 7.584 0 01.42 8c0-.731.103-1.438.296-2.107l1.936-.346c.154-.335.338-.653.55-.95l-.668-1.85A7.572 7.572 0 016.184.64l1.268 1.504a5.956 5.956 0 011.096 0L9.817.639zm.496 1.737L9.19 3.709l-.78-.072a4.456 4.456 0 00-.41-.02l-.206.006-.204.014-.78.072-1.124-1.333-.222.096c-.346.159-.675.35-.984.57l-.194.144.593 1.64-.455.64a4.384 4.384 0 00-.287.463l-.122.244-.327.713-1.713.305-.017.12a6.128 6.128 0 00-.029.343L1.92 8c0 .232.014.462.04.689l.016.119 1.713.306.327.713c.076.165.162.325.258.48l.151.227.455.64-.593 1.639.194.145c.31.22.638.411.984.57l.222.095 1.123-1.332.78.072c.136.013.273.02.411.02l.206-.006.204-.014.78-.072 1.123 1.332.224-.095c.345-.159.674-.35.983-.57l.193-.145-.592-1.639.455-.64c.105-.148.201-.303.287-.463l.122-.244.327-.713 1.712-.306.018-.12c.013-.113.022-.227.029-.342L14.08 8c0-.232-.014-.462-.04-.689l-.017-.12-1.712-.305-.327-.713a4.368 4.368 0 00-.258-.48l-.151-.227-.455-.64.592-1.64-.193-.144c-.309-.22-.638-.411-.983-.57l-.224-.096zM8 5a3 3 0 110 6 3 3 0 010-6zm0 1.5a1.5 1.5 0 100 3 1.5 1.5 0 000-3z' fill='#fff'  fill-rule='nonzero'/></svg>`

    const [componentString, setComponentString] = useSyncedState("componentString", ``)

    usePropertyMenu(
        [
            {
                itemType: "action",
                tooltip: "Action",
                icon: settingsIcon,
                propertyName: "action",
            },
        ],
        async ({ propertyName, propertyValue }) => {
            if (propertyName === "action") {
                await new Promise((resolve) => {
                    figma.showUI(__html__, { width: 500, height: 400 })

                    if (componentString != "") {
                        figma.ui.postMessage({
                            type: "previouseComponentString",
                            data: componentString,
                        })
                    }

                    figma.ui.on("message", (msg) => {
                        if (msg?.type === "setComponentString") {
                            setComponentString(msg?.data)
                        }
                        if (msg === "close") {
                            figma.closePlugin()
                        }
                    })
                })
            }
        }
    )

    return (
        <AutoLayout>
            {componentString ? (
                <AutoLayout
                    direction="horizontal"
                    horizontalAlignItems="center"
                    verticalAlignItems="center"
                    height="hug-contents"
                    padding={{ vertical: 24, horizontal: 32 }}
                    fill="#E95420"
                    strokeWidth={4}
                    hoverStyle={{
                        fill: "#DA4816",
                        stroke: "#111111",
                    }}
                    onClick={async () => {
                        await new Promise((resolve) => {
                            figma.showUI(__html__, { visible: false })

                            figma.ui.postMessage({
                                type: "copyToClipboard",
                                data: componentString,
                            })
                            figma.ui.on("message", (msg) => {
                                if (msg === "success") {
                                    figma.notify("Copied component to clipboard 👍")
                                }
                                if (msg === "failure") {
                                    figma.notify("Something went wrong when trying to copy component to clipboard 😔")
                                }
                                if (msg === "close") {
                                    figma.closePlugin()
                                }
                            })
                        })
                    }}
                >
                    <Text fontFamily="Ubuntu" fontSize={64} fill="#FFFFFF" horizontalAlignText="center">
                        💠 Click to copy component
                    </Text>
                </AutoLayout>
            ) : (
                <AutoLayout direction="vertical" fill="#FFF" padding={16}>
                    <Text fontFamily="Ubuntu" fontSize={32} fill="#000" horizontalAlignText="center">
                        No component has been set yet.
                    </Text>
                    <Text fontFamily="Ubuntu" fontSize={32} fill="#000" horizontalAlignText="center">
                        Select the widget, go to the settings of the widget and set a component.
                    </Text>
                </AutoLayout>
            )}
        </AutoLayout>
    )
}
widget.register(Widget)
