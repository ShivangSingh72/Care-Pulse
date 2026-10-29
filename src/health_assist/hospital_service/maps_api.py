import sys

import requests

from health_assist.exception import AppException
from health_assist.logger import logger
from health_assist.entity.config_entity import MapsConfig


class MapsAPI:
    """
    Thin wrapper around OpenStreetMap's Nominatim (geocoding) and
    Overpass (POI search) APIs.

    All URLs, timeouts, and user-agent settings come from MapsConfig.
    """

    def __init__(self, config: MapsConfig):
        self.config = config

    def get_coordinates(self, location: str):
        """
        Geocode a free-text location string into (lat, lon).

        Returns None if no location is found.
        """
        try:
            params = {
                "q": location,
                "format": "json",
                "limit": 1,
            }

            response = requests.get(
                self.config.nominatim_url,
                params=params,
                headers={
                    "User-Agent": self.config.user_agent
                },
                timeout=self.config.geocode_timeout,
            )

            response.raise_for_status()

            data = response.json()

            if not data:
                logger.info(
                    f"No coordinates found for location: {location}"
                )
                return None

            lat = float(data[0]["lat"])
            lon = float(data[0]["lon"])

            logger.info(
                f"Geocoded '{location}' to ({lat}, {lon})."
            )

            return lat, lon

        except AppException:
            raise

        except Exception as e:
            raise AppException(e, sys)

    def nearby_hospitals(
        self,
        lat: float,
        lon: float,
        radius: int = None,
    ):
        """
        Find hospitals near the given coordinates.

        Multiple public Overpass servers are tried as fallbacks
        because public Overpass instances can occasionally timeout
        or return gateway errors.
        """
        try:
            radius = radius or self.config.default_radius

            query = f"""
            [out:json][timeout:20];
            (
                node["amenity"="hospital"](
                    around:{radius},{lat},{lon}
                );

                way["amenity"="hospital"](
                    around:{radius},{lat},{lon}
                );

                relation["amenity"="hospital"](
                    around:{radius},{lat},{lon}
                );
            );

            out center tags;
            """

            endpoints = [
                self.config.overpass_url,
                "https://overpass.private.coffee/api/interpreter",
                "https://maps.mail.ru/osm/tools/overpass/api/interpreter",
            ]

            last_error = None

            for endpoint in endpoints:
                try:
                    logger.info(
                        f"Trying Overpass endpoint: {endpoint}"
                    )

                    response = requests.post(
                        endpoint,
                        data=query,
                        headers={
                            "User-Agent": self.config.user_agent,
                            "Accept": "application/json",
                        },
                        timeout=self.config.overpass_timeout,
                    )

                    response.raise_for_status()

                    elements = response.json().get(
                        "elements",
                        []
                    )

                    logger.info(
                        f"Overpass returned "
                        f"{len(elements)} raw hospital elements "
                        f"near ({lat}, {lon})."
                    )

                    return elements

                except requests.RequestException as e:
                    last_error = e

                    logger.warning(
                        f"Overpass endpoint failed: "
                        f"{endpoint} | {e}"
                    )

            raise AppException(
                f"All Overpass endpoints failed. "
                f"Last error: {last_error}",
                sys,
            )

        except AppException:
            raise

        except Exception as e:
            raise AppException(e, sys)