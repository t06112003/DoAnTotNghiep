import '../../styles/Footer.css'

export default function Footer() {
    return (
        <footer className="footer-section">
            <div className="footer-container">
                <div className="footer-right-container">
                    <div className="footer-col">
                        <div className="social-medias">
                            <div className="icon-20 facebook"></div>
                            <a
                                className="footer-options"
                                href="https://www.facebook.com/duriustudio"
                                target="blank"
                            >
                                Facebook
                            </a>
                        </div>
                        <div className="social-medias">
                            <div className="icon-20 youtube"></div>
                            <a
                                className="footer-options"
                                href="https://www.youtube.com/@RhymxDepTrai"
                                target="blank"
                            >
                                Youtube
                            </a>
                        </div>
                        <div className="social-medias">
                            <div className="icon-20 github"></div>
                            <a
                                className="footer-options"
                                href="https://github.com/LeQuangThanh69420"
                                target="blank"
                            >
                                GitHub
                            </a>
                        </div>
                        <div className="social-medias">
                            <div className="icon-20 discord"></div>
                            <a
                                className="footer-options"
                                href="https://discord.gg/7Evqn6NAYW"
                                target="blank"
                            >
                                Discord
                            </a>
                        </div>
                    </div>
                    <div className="footer-col">
                        <div className="techs">
                            <div className="techs-rows">
                                <div className="icon-32 react"></div>
                                <div className="icon-32 dotnet"></div>
                                <div className="icon-32 sqlServer"></div>
                            </div>
                            <div className="techs-rows">
                                <div className="icon-32 html"></div>
                                <div className="icon-32 css"></div>
                                <div className="icon-32 js"></div>
                                <div className="icon-32 csharp"></div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <div className="line"></div>
            <div className="copy-right">
                <p className="text-footer">
                    © 2023 DuRiu Studio - All rights are served
                </p>
            </div>
        </footer>
    )
}