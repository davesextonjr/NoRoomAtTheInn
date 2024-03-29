import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { NavLink, useHistory, useParams } from "react-router-dom";
import { getReviewsThunk } from "../../store/reviews";
import { findSpotById, resetSingleSpotState } from "../../store/singleSpot";
import { deleteSpotThunk } from "../../store/spots";
import './singleSpot.css'
import { Modal } from "../../context/Modal";
import ReviewPage from "../ReviewPage";
import EditSpotForm from "../EditSpotForm";
import RoomSurance from "../RoomSuranceInfo";
import AddReviewForm from "../AddReviewForm";
import EditReviewForm from "../EditReviewForm";
import AddBooking from "../Bookings/AddBooking";


export default function SingleSpot() {
    const { spotId } = useParams();
    const dispatch = useDispatch();
    const history = useHistory();
    const [showAllReviewsModal, setShowAllReviewsModal] = useState(false);
    const [showEditSpotModal, setShowEditSpotModal] = useState(false);
    const [showRoomsuranceModal, setShowRoomsuranceModal] = useState(false);
    const [showAuthorReviewModal, setShowAuthorReviewModal] = useState(false);
    const roomSuranceLogo = "/assets/roomsurance-logo.png"
    const sign = '/assets/lets-be-cozy.jpeg'
    const kitchen = '/assets/rustic-kitchen.jpeg'
    const garden = "/assets/indoor-garden.jpeg"
    const library = "/assets/overstuffed chair.jpeg"


    useEffect(() => {
        dispatch(findSpotById(spotId))
        dispatch(getReviewsThunk(spotId))
    }, [spotId, showAuthorReviewModal])

    const currentSpot = useSelector(state => state.singleSpot[+spotId])

    const reviewsArray = useSelector(state => Object.values(state.reviews));
    const latestReview = reviewsArray[reviewsArray.length - 1]

    const reviewerId = reviewsArray.map(reviewObj => reviewObj.userId)


    const currentUser = useSelector(state => state.session.user)



    const userHasReviewed = currentUser && reviewerId.includes(currentUser.id)

    if (!currentSpot) {
        return <div>No Spot Selcted</div>
    }

    const deleteHandler = (e) => {
        e.preventDefault()
        if (window.confirm("Are you sure you want to delete this spot?")) {
            dispatch(deleteSpotThunk(spotId))
            dispatch(resetSingleSpotState())
            history.push('/')
        }
    }


    return (
        <div id="spot-page">
            {/* header */}
            <div id="spot-header">
                <div id="spot-header-name-container">
                    <div id="spot-header-name" >{currentSpot.name}</div>
                    {currentUser && currentSpot && currentUser.id === currentSpot.Owner.id &&
                        (<div id="edit-delete-spot-container">

                            <button onClick={() => setShowEditSpotModal(true)} id="edit-spot-button">Edit Your Spot</button>
                            {showEditSpotModal && <Modal onClose={() => setShowEditSpotModal(false)}>
                                <EditSpotForm onComplete={() => setShowEditSpotModal(false)}/>
                            </Modal>}
                            <button onClick={deleteHandler}>Delete Your Spot</button>

                        </div>)}
                </div>
                <div id="spot-header-nav">
                    <div id="spot-header-nav-left">
                        <div id="spot-header-rating" >★ {currentSpot.avgStarRating}</div>
                        <div id="spot-header-review-number">{currentSpot.numReviews} reviews</div>
                        <div>{currentSpot.city}, {currentSpot.state}, {currentSpot.country} </div>
                    </div>
                    {/* <div id="spot-header-nav-right">
                        <div>Share</div>
                    </div> */}
                </div>
            </div>
            {/* pictures */}
            <div id="spot-picture-container">
                <div id="spot-default-image-container">
                    <img id="spot-default-image" src={currentSpot.SpotImages[0].url} />
                </div>
                <div className="spot-secondary-pictures pic-one">
                    {currentSpot.SpotImages[1] ? (<img src={currentSpot.SpotImages[1].url} />) :
                        (<img src={sign} />)}
                </div>
                <div className="spot-secondary-pictures pic-two">
                    {currentSpot.SpotImages[2] ? (<img src={currentSpot.SpotImages[1].url} />) : (<img src={kitchen} />)}
                </div>
                <div className="spot-secondary-pictures pic-three">
                    {currentSpot.SpotImages[3] ? (<img src={currentSpot.SpotImages[1].url} />) : (<img src={garden} />)}
                </div>
                <div className="spot-secondary-pictures pic-four">
                    {currentSpot.SpotImages[4] ? (<img src={currentSpot.SpotImages[1].url} />) : (<img src={library} />)}
                </div>
            </div>
            <div id="spot-owner-container">
                <div id="onwner-title">This spot is hosted by {currentSpot.Owner.firstName}
                </div>



                <div id="city-state-undercard">
                    <div>{currentSpot.city},{" "}</div>
                    <div>{" "}{currentSpot.state}</div>
                </div>

                <div id="spot-detail-card">
                    <div id="spot-detail-card-header">

                        <div id="spot-price"><span>${currentSpot.price}</span> night</div>
                        <div id="spot-detail-card-review-container">
                            <div>★ {currentSpot.avgStarRating} </div>
                            <div>・</div>
                            <div>{currentSpot.numReviews} reviews</div>
                        </div>
                    </div>

                    {latestReview && <div id="display-review-container">
                        <div id="latest-header">What people are saying:</div>
                        <div>{latestReview.review}</div>
                        <div>- {latestReview.stars} stars</div>
                    </div>}

                    {/* { &&  <NavLink to={`/reviews/${spotId}/edit`} id="write-review">Edit Your Review</NavLink>} */}


                    {currentUser && currentUser.id !== currentSpot.Owner.id && <button className="red" onClick={() => setShowAuthorReviewModal(true)} id="write-review">
                        {userHasReviewed ? (<>Edit Review</>) : (<>Write a Review</>)}
                    </button>}
                    {showAuthorReviewModal && <Modal onClose={() => setShowAuthorReviewModal(false)}>
                        {userHasReviewed ? <EditReviewForm onComplete={() => setShowAuthorReviewModal(false)} /> : <AddReviewForm onComplete={() => setShowAuthorReviewModal(false)} />}
                    </Modal>}

                    {!currentUser && (
                        <p>Please log in or sign up to leave a review</p>
                    )}

                    <button className="red" onClick={() => setShowAllReviewsModal(true)} id="get-review">See All Reviews</button>
                    {showAllReviewsModal && <Modal onClose={() => setShowAllReviewsModal(false)}>
                        <ReviewPage />
                    </Modal>}



                </div>
                <AddBooking/>

                <div id="spot-highlights-container">
                    <i className="fa-solid fa-medal icons">
                    </i>
                    <div className="award-container">
                        <div className="award-highlight">{currentSpot.name}'s awards</div>
                        <div className="award-details">
                            Coming soon! This spot will be used to display some of the highlights that make {currentSpot.Owner.firstName}'s property stand out.
                        </div>
                    </div>
                </div>

                <div id="insurance-container">
                    <img src={roomSuranceLogo} />
                    <div>
                        Nothing's worse than not having a place to stay. Every booking comes with protection from the unexpected. Book without worrying about a host canceling, inaccurate spot details, and so much more.
                    </div>
                    <button onClick={() => setShowRoomsuranceModal(true)} id="room-surance-button">See more details</button>
                    {showRoomsuranceModal && <Modal cssClass='roomsuranceModal' onClose={() => setShowRoomsuranceModal(false)}>
                        <RoomSurance />
                    </Modal>}


                </div>

                <div id="spot-description-container">
                    <div>{currentSpot.description}</div>
                </div>

                <div id="place-offering-snapshot-container">
                    <div id="offering-header">All our spots offer:</div>
                    <div className="spot-offering-list-container">
                        <div className="spot-offering">
                            <i className="fa-solid fa-mug-hot"></i>
                            <p className="offering-lable">Premium Coffe</p>
                        </div>
                        <div className="spot-offering">
                            <i class="fa-solid fa-book-journal-whills"></i>
                            <p className="offering-lable">Curated Library</p>
                        </div>
                        <div className="spot-offering">
                            <i class="fa-regular fa-map"></i>
                            <p className="offering-lable">Guide to Hidden Gems</p>
                        </div>
                        <div className="spot-offering">
                            <i class="fa-solid fa-stamp"></i>
                            <p className="offering-lable">One-of-a-Kind Stamp</p>
                        </div>
                        <div className="spot-offering">
                            <i class="fa-solid fa-guitar"></i>
                            <p className="offering-lable">Ukulele Loan and Lessons</p>
                        </div>
                        <div className="spot-offering">
                            <i class="fa-solid fa-kitchen-set"></i>
                            <p className="offering-lable">Local Flavor Recipies and Ingrediants</p>
                        </div>
                    </div>
                </div>

            </div>

        </div>

    )
}
