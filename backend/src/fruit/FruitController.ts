import { Controller, Route, Example, Get, Path, Query } from "tsoa";

interface Fruit {
    name: string,
    price: number
}

const TEST: Record<string, Fruit> = {
    "apple": {
        name: "Apple",
        price: 0.25
    },
    "banana": {
        name: "Banana",
        price: 0.45
    },
    "orange": {
        name: "Orange",
        price: 0.25
    },
    "coconut": {
        name: "Orange",
        price: 0.25
    },
    "grape": {
        name: "Grape",
        price: 0.005
    },
}

@Route("fruits")
export class FruitController extends Controller {
  @Example<Fruit>({
    name: "Apple",
    price: 0.35
  })
  @Get("{fruitId}")
  public async get_fruit(
    @Path() fruitId: string,
  ): Promise<Fruit> {
    return TEST[fruitId];
  }

  @Get()
  public async list_fruits() : Promise<string[]> {
    return Object.keys(TEST);
  }
}