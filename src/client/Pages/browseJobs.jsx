export default function BrowseJobs(props) {
    return(
        <>
            <header className="header">
                <div className="logo">PlaceME</div>
                <nav>
                    <a href="/dashboard">Home</a>
                    <a href="/dashboard/updateprofile">My Profile</a>
                    <a href="/login">Logout</a>
                </nav>
            </header>

            <div className="browse-jobs-container">
                <h1 className="browse-jobs-title">Browse Available Jobs</h1>
                <div className="job-listing">
                    <h2 className="job-title">Software Development Engineer Intern</h2>
                    <h4 className="company-name">Acme Innovations</h4>
                    <p className="location">Location: Bangalore, India (Hybrid)</p>
                    <p>
                        We are seeking a passionate Software Development Engineer Intern to join our dynamic team. You will work on real-world projects, contributing to our core product development.
                    </p>
                    <p className="location">Skills: Python, Java, Data Structures, Algorithms, Git, SQL</p>

                    <p className="application-deadline">Application Deadline: July 25, 2025</p>
                    <button className="apply-button">View Details & Apply</button>
                </div>

                <div className="job-listing">
                    <h2 className="job-title">Junior Data Analyst</h2>
                    <h4 className="company-name">Global Analytics Co.</h4>
                    <p className="location">Location: Remote</p>
                    <p>
                        Join our data team to help analyze large datasets, create reports, and derive actionable insights. Strong analytical skills and attention to detail are a must.
                    </p>
                    <p className="location">Skills: SQL, Excel, Python (Pandas), Data Visualization, Statistics</p>

                    <p className="application-deadline">Application Deadline: August 10, 2025</p>
                    <button className="apply-button">View Details & Apply</button>
                </div>

                <div className="job-listing">
                    <h2 className="job-title">UI/UX Design Intern</h2>
                    <h4 className="company-name">Creative Spark Studio</h4>
                    <p className="location">Location: Mumbai, India</p>
                    <p>
                        We're looking for a creative UI/UX Design Intern to assist in designing user-friendly interfaces for our web and mobile applications. Portfolio required.
                    </p>
                    <p className="location">Skills: Figma, Adobe XD, User Research, Wireframing, Prototyping</p>

                    <p className="application-deadline">Application Deadline: July 30, 2025</p>
                    <button className="apply-button">View Details & Apply</button>
                </div>
            </div>
        </>
    )
}