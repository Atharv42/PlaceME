export default function updateProflie() {
    return (
        <>
            <header className="header">
            <div className="logo">PlaceME</div>
            <nav>
                <a href="/dashboard">Home</a>
                <a href="#">My Profile</a>
                <a href="/login">Logout</a>
            </nav>
        </header>

        <div className="update-profile-container">
            <h1 className="update-profile-title">Update your profile</h1>
            <form>
                <label className="update-profile-fillup">First Name</label>
                <input type="text" placeholder="First Name" className="input" />
                <br />
                <label className="update-profile-fillup">Last Name</label>
                <input type="text" placeholder="Last Name" className="input" />
                <br />
                <label className="update-profile-fillup">Email</label>
                <input type="email" placeholder="Email" className="input" />
                <br />
                <label className="update-profile-fillup">Contact No.</label>
                <input type="text" placeholder="Contact No." className="input" />
                <br />
                <label className="update-profile-fillup">Address</label>
                <input type="text" placeholder="Address" className="input" />
                <br />
                <label className="update-profile-fillup">Education</label>
                <input type="text" placeholder="e.g., B.Tech Computer Science, University Name, Year" className="input" />
                <br />
                <label className="update-profile-fillup">Skills</label>
                <input type="text" placeholder=" e.g., Python, JavaScript, React, SQL" className="input" />
                <br />
                <label className="update-profile-fillup">Work Experience</label>
                <input type="text" placeholder="e.g., Intern at Company A, Role, Dates" className="input" />
                <br />
                <label className="update-profile-fillup">Upload/Update Resume (PDFF, DOCS)</label>
                <input type="file" className="input"/>
                <br />
                <div className="update-profile-buttons">
                <button className="update-button">Update Profile</button>
                <a href="/dashboard" className="update-button">Back to Dashboard</a>
                </div>
   
            </form>
        </div>
        </>
    )
}