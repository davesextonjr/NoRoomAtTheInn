import { useEffect, useState } from "react";
import { useHistory } from "react-router-dom";
import { csrfFetch } from "../../store/csrf";
import { dateFormatter } from "../utilities";



export function UserBookings() {
    const [isLoaded, setIsLoaded] = useState(false)
    const [bookings, setBookings] = useState([])
    const history = useHistory()
    useEffect(() => {
        (async () => {
            const res = await csrfFetch('/api/bookings/current')
            const fetchedBookings = await res.json()
            setBookings(fetchedBookings.Bookings)
            setIsLoaded(true)
        })()
    }, [isLoaded])


    const deleteHandler = async e => {
        e.preventDefault()
        const res = await csrfFetch(`/api/bookings/${e.target.id}`, {
            method: 'DELETE'
        })
        if(res.ok) setIsLoaded(false)
    }


    return isLoaded && (
        <div className="bookingsContainer">
            <div className="title">Your Upcoming Stays</div>
            <div className="sub-title">Click on a reservation to see that spot's details</div>
            {bookings.length && bookings.map(booking => {
                return (
                    <div key={`booking-${booking.id}`}>
                        <div onClick={(() => history.push(`/spots/${booking.spotId}`))}>{dateFormatter(booking.startDate, booking.endDate)}</div>
                        <button id={booking.id}
                            onClick={deleteHandler}
                        >Delete</button>
                    </div>
                )
            })}
        </div>
    )

}
