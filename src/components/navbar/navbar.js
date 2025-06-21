import React from 'react';
import {
	Nav,
	NavLink,
	NavMenu,
	NavBtn,
	NavBtnLink,
} from './NavbarElements';

const Navbar = () => {
	return (
		<>
			<Nav className="nav-links">

				<NavMenu>

					<NavLink to='/homepage'>
						Home
					</NavLink>

					{/* <NavLink to='/updatePage'>
						Update
					</NavLink> */}

					<NavLink to='/register'>
						Sign Up/Register
					</NavLink>

					{/* Second Nav */}
					{/* <NavBtnLink to='/sign-in'>Sign In</NavBtnLink> */}
				</NavMenu>

				<NavBtn>
					<NavBtnLink to='/login'>
						Sign In/Login
					</NavBtnLink>
				</NavBtn>
			</Nav>
		</>
	);
};

export default Navbar;
