"use client";

// This components shows one individual restaurant
// It receives data from src/app/restaurant/[id]/page.jsx

import { React, useState, useEffect, Suspense } from "react";
import dynamic from "next/dynamic";
import { getRestaurantSnapshotById } from "@/src/lib/firebase/firestore.js";
import { useUser } from "@/src/lib/getUser";
import RestaurantDetails from "@/src/components/RestaurantDetails.jsx";
import { updateRestaurantImage } from "@/src/lib/firebase/storage.js";

// Loaded only when the dialog is needed, so the restaurant page stays smaller.
const ReviewDialog = dynamic(() => import("@/src/components/ReviewDialog.jsx"));

export default function Restaurant({
  id,
  initialRestaurant,
  initialUserId,
  children,
}) {
  // Start from the server-rendered restaurant, then replace it when Firestore updates.
  const [restaurantDetails, setRestaurantDetails] = useState(initialRestaurant);
  const [isOpen, setIsOpen] = useState(false);

  // The only reason this component needs to know the user ID is to associate a review with the user, and to know whether to show the review dialog
  const userId = useUser()?.uid || initialUserId;
  const [review, setReview] = useState({
    rating: 0,
    text: "",
  });

  // Updates one field of the draft review, either "text" or "rating".
  const onChange = (value, name) => {
    setReview({ ...review, [name]: value });
  };

  // Uploads the chosen file and shows the new photo immediately.
  async function handleRestaurantImage(target) {
    const image = target.files ? target.files[0] : null;
    if (!image) {
      return;
    }

    const imageURL = await updateRestaurantImage(id, image);
    setRestaurantDetails({ ...restaurantDetails, photo: imageURL });
  }

  // Closes the dialog and clears the draft so the next review starts blank.
  const handleClose = () => {
    setIsOpen(false);
    setReview({ rating: 0, text: "" });
  };

  // Subscribes to this restaurant document and unsubscribes when the id changes.
  useEffect(() => {
    return getRestaurantSnapshotById(id, (data) => {
      setRestaurantDetails(data);
    });
  }, [id]);

  return (
    <>
      <RestaurantDetails
        restaurant={restaurantDetails}
        userId={userId}
        handleRestaurantImage={handleRestaurantImage}
        setIsOpen={setIsOpen}
        isOpen={isOpen}
      >
        {children}
      </RestaurantDetails>
      {/* Guests cannot leave a review, so the dialog is omitted until someone is signed in. */}
      {userId && (
        <Suspense fallback={<p>Loading...</p>}>
          <ReviewDialog
            isOpen={isOpen}
            handleClose={handleClose}
            review={review}
            onChange={onChange}
            userId={userId}
            id={id}
          />
        </Suspense>
      )}
    </>
  );
}
