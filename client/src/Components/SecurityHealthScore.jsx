function SecurityHealthScore({ score, status }) {
    return (
        <section>
            <h2>Security Health Score</h2>

            <h1>
                {score}/100
            </h1>

            <p>
                Status: <strong>{status}</strong>
            </p>
        </section>
    );
}


export default SecurityHealthScore;